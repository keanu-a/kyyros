package com.kyyros.service;

import com.kyyros.dto.*;
import com.kyyros.exception.ForbiddenOperationException;
import com.kyyros.exception.ResourceNotFoundException;
import com.kyyros.model.Comment;
import com.kyyros.model.User;
import com.kyyros.model.Video;
import com.kyyros.repository.CommentLikeRepository;
import com.kyyros.repository.CommentLikeRepository.CommentLikeStats;
import com.kyyros.repository.CommentRepository;
import com.kyyros.repository.UserRepository;
import com.kyyros.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final CommentLikeRepository commentLikeRepository;

    @Transactional
    public CommentResponse createComment(UUID videoId, CreateCommentRequest request, UUID userId) {

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found: " + videoId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Comment comment = new Comment();
        comment.setVideo(video);
        comment.setUser(user);
        comment.setContent(request.content());
        comment.setTimestampSeconds(request.timestampSeconds());

        Comment savedComment = commentRepository.saveAndFlush(comment);

        // A new comment has no likes yet
        return toResponse(savedComment, savedComment.getTimestampSeconds(), Map.of());
    }

    @Transactional
    public CommentResponse createReply(UUID parentCommentId, CreateReplyRequest request, UUID userId) {

        Comment target = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + parentCommentId));

        // Enforce one-level nesting: a reply to a reply attaches to the thread's root
        Comment root = target.getParentComment() != null ? target.getParentComment() : target;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Comment reply = new Comment();
        reply.setVideo(root.getVideo());
        reply.setUser(user);
        reply.setContent(request.content());
        reply.setParentComment(root);

        Comment savedComment;
        try {
            savedComment = commentRepository.saveAndFlush(reply);
        } catch (DataIntegrityViolationException e) {
            // The root was deleted after we loaded it, so the parent FK no longer resolves
            log.info("Reply insert failed, parent comment {} was deleted concurrently", root.getId());
            throw new ResourceNotFoundException("Comment not found: " + root.getId());
        }

        return toResponse(savedComment, root.getTimestampSeconds(), Map.of());
    }

    // userId is null for anonymous viewers
    @Transactional(readOnly = true)
    public List<CommentResponse> getVideoComments(UUID videoId, UUID userId) {
        if (!videoRepository.existsById(videoId)) {
            throw new ResourceNotFoundException("Video not found: " + videoId);
        }

        List<Comment> rootComments = commentRepository
                .findCommentByVideoIdWithRepliesAndUsers(videoId);

        // One query for the like stats of every comment and reply on the video
        Map<UUID, CommentLikeStats> likeStats = commentLikeRepository
                .findLikeStatsByVideoId(videoId, userId)
                .stream()
                .collect(Collectors.toMap(CommentLikeStats::getCommentId, Function.identity()));

        return rootComments.stream()
                .map(c -> toResponse(c, c.getTimestampSeconds(), likeStats))
                .toList();
    }

    @Transactional
    public CommentSummaryResponse updateComment(UUID commentId, UpdateCommentRequest request, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!comment.getUser().getId().equals(userId)) {
            throw new ForbiddenOperationException("You can only edit your own comment");
        }

        comment.setContent(request.content());
        Comment savedComment = commentRepository.saveAndFlush(comment);

        Double effectiveTimestamp = savedComment.getParentComment() == null
                ? savedComment.getTimestampSeconds()
                : savedComment.getParentComment().getTimestampSeconds();

        User user = savedComment.getUser();

        return new CommentSummaryResponse(
                savedComment.getId(),
                savedComment.getContent(),
                effectiveTimestamp,
                new UserSummary(user.getId(), user.getUsername(), user.getProfilePictureUrl()),
                savedComment.getCreatedAt(),
                savedComment.getUpdatedAt()
        );
    }

    @Transactional
    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!comment.getUser().getId().equals(userId)) {
            throw new ForbiddenOperationException("You can only delete your own comment");
        }

        commentRepository.delete(comment);
    }

    // likeStats has no entry for comments with zero likes
    private CommentResponse toResponse(
            Comment comment,
            Double effectiveTimestamp,
            Map<UUID, CommentLikeStats> likeStats
    ) {
        User user = comment.getUser();
        UserSummary userSummary = new UserSummary(
                user.getId(),
                user.getUsername(),
                user.getProfilePictureUrl()
        );

        List<CommentResponse> replyResponses = comment.getReplies() == null
                ? List.of()
                : comment.getReplies().stream()
                        .map(reply -> toResponse(reply, effectiveTimestamp, likeStats))
                        .toList();

        CommentLikeStats stats = likeStats.get(comment.getId());
        long likeCount = stats == null ? 0 : stats.getLikeCount();
        boolean likedByMe = stats != null && Boolean.TRUE.equals(stats.getLikedByMe());

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                effectiveTimestamp,
                userSummary,
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                likeCount,
                likedByMe,
                replyResponses
        );
    }
}
