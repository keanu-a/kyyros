package com.kyyros.service;

import com.kyyros.dto.LikeStatusResponse;
import com.kyyros.enums.VideoStatus;
import com.kyyros.exception.BadRequestException;
import com.kyyros.exception.ResourceNotFoundException;
import com.kyyros.model.Video;
import com.kyyros.model.VideoLikeId;
import com.kyyros.repository.CommentLikeRepository;
import com.kyyros.repository.CommentRepository;
import com.kyyros.repository.UserRepository;
import com.kyyros.repository.VideoLikeRepository;
import com.kyyros.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final VideoLikeRepository videoLikeRepository;
    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public LikeStatusResponse likeVideo(UUID videoId, UUID userId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found: " + videoId));

        if (video.getStatus() != VideoStatus.READY) {
            throw new BadRequestException("Only ready videos can be liked");
        }

        // Native insert skips loading the user, so check it exists to avoid an FK violation
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }

        videoLikeRepository.insertIfAbsent(userId, videoId);

        return new LikeStatusResponse(videoLikeRepository.countByVideoId(videoId), true);
    }

    @Transactional
    public LikeStatusResponse unlikeVideo(UUID videoId, UUID userId) {
        if (!videoRepository.existsById(videoId)) {
            throw new ResourceNotFoundException("Video not found: " + videoId);
        }

        videoLikeRepository.deleteByUserIdAndVideoId(userId, videoId);

        return new LikeStatusResponse(videoLikeRepository.countByVideoId(videoId), false);
    }

    // userId is null for anonymous viewers
    @Transactional(readOnly = true)
    public LikeStatusResponse getLikeStatus(UUID videoId, UUID userId) {
        if (!videoRepository.existsById(videoId)) {
            throw new ResourceNotFoundException("Video not found: " + videoId);
        }

        boolean likedByMe = userId != null
                && videoLikeRepository.existsById(new VideoLikeId(userId, videoId));

        return new LikeStatusResponse(videoLikeRepository.countByVideoId(videoId), likedByMe);
    }

    // Works for root comments and replies alike, so replies need no extra logic
    @Transactional
    public LikeStatusResponse likeComment(UUID commentId, UUID userId) {
        if (!commentRepository.existsById(commentId)) {
            throw new ResourceNotFoundException("Comment not found: " + commentId);
        }

        // Native insert skips loading the user, so check it exists to avoid an FK violation
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }

        commentLikeRepository.insertIfAbsent(userId, commentId);

        return new LikeStatusResponse(commentLikeRepository.countByCommentId(commentId), true);
    }

    @Transactional
    public LikeStatusResponse unlikeComment(UUID commentId, UUID userId) {
        if (!commentRepository.existsById(commentId)) {
            throw new ResourceNotFoundException("Comment not found: " + commentId);
        }

        commentLikeRepository.deleteByUserIdAndCommentId(userId, commentId);

        return new LikeStatusResponse(commentLikeRepository.countByCommentId(commentId), false);
    }
}
