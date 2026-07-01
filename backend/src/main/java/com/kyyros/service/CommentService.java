package com.kyyros.service;

import com.kyyros.dto.*;
import com.kyyros.exception.BadRequestException;
import com.kyyros.exception.ForbiddenOperationException;
import com.kyyros.exception.ResourceNotFoundException;
import com.kyyros.model.Comment;
import com.kyyros.model.User;
import com.kyyros.model.Video;
import com.kyyros.repository.CommentRepository;
import com.kyyros.repository.UserRepository;
import com.kyyros.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final VideoRepository videoRepository;
    private final UserRepository userRepository;

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

        return toResponse(savedComment, savedComment.getTimestampSeconds());
    }

    @Transactional
    public CommentResponse createReply(UUID parentCommentId, CreateReplyRequest request, UUID userId) {

        Comment parent = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + parentCommentId));

        // Enforce one-level nesting
        if (parent.getParentComment() != null) {
            throw new BadRequestException("Cannot reply to a reply. Replies can only be made to root comments");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Comment reply = new Comment();
        reply.setVideo(parent.getVideo());
        reply.setUser(user);
        reply.setContent(request.content());
        reply.setParentComment(parent);

        Comment savedComment = commentRepository.saveAndFlush(reply);
        return toResponse(savedComment, parent.getTimestampSeconds());
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getVideoComments(UUID videoId) {
        if (!videoRepository.existsById(videoId)) {
            throw new ResourceNotFoundException("Video not found: " + videoId);
        }

        List<Comment> rootComments = commentRepository
                .findCommentByVideoIdWithRepliesAndUsers(videoId);

        return rootComments.stream()
                .map(c -> toResponse(c, c.getTimestampSeconds()))
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

    private CommentResponse toResponse(Comment comment, Double effectiveTimestamp) {
        User user = comment.getUser();
        UserSummary userSummary = new UserSummary(
                user.getId(),
                user.getUsername(),
                user.getProfilePictureUrl()
        );

        List<CommentResponse> replyResponses = comment.getReplies() == null
                ? List.of()
                : comment.getReplies().stream().map(reply -> toResponse(reply, effectiveTimestamp)).toList();

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                effectiveTimestamp,
                userSummary,
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                replyResponses
        );
    }
}
