package com.kyyros.controller;

import com.kyyros.dto.*;
import com.kyyros.security.ratelimit.RateLimit;
import com.kyyros.service.CommentService;
import com.kyyros.service.LikeService;
import com.kyyros.service.VideoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/videos")
public class VideoController {

    private final VideoService videoService;
    private final CommentService commentService;
    private final LikeService likeService;

    @PostMapping
    @RateLimit(name = "upload-init", capacity = 4, periodSeconds = 3600)
    public ResponseEntity<CreateVideoResponse> initiateUpload(
            @Valid @RequestBody CreateVideoRequest request,
            @AuthenticationPrincipal String userId
    ) {
        CreateVideoResponse response = videoService.initiateUpload(request, UUID.fromString(userId));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<VideoSummaryResponse>> getAllVideos(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(required = false) UUID excludeVideoId
    ) {
        Page<VideoSummaryResponse> response = videoService.getVideos(pageable, excludeVideoId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GetVideoResponse> getVideo(@PathVariable UUID id) {
        GetVideoResponse response = videoService.getVideoById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> processStatusUpdate(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateVideoStatusRequest request,
            @AuthenticationPrincipal String userId
    ) {

        videoService.processStatusUpdate(id, request, UUID.fromString(userId));

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideo(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId
    ) {
        videoService.deleteVideo(id, UUID.fromString(userId));

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{videoId}/comments")
    @RateLimit(name = "comment-create", capacity = 10, periodSeconds = 60)
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable UUID videoId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal String userId
    ) {
        CommentResponse response = commentService.createComment(videoId, request, UUID.fromString(userId));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{videoId}/comments")
    public ResponseEntity<List<CommentResponse>> getVideoComments(@PathVariable UUID videoId) {
        List<CommentResponse> comments = commentService.getVideoComments(videoId);
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/{videoId}/like")
    @RateLimit(name = "video-like", capacity = 30, periodSeconds = 60)
    public ResponseEntity<LikeStatusResponse> likeVideo(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal String userId
    ) {
        LikeStatusResponse response = likeService.likeVideo(videoId, UUID.fromString(userId));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{videoId}/like")
    @RateLimit(name = "video-like", capacity = 30, periodSeconds = 60)
    public ResponseEntity<LikeStatusResponse> unlikeVideo(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal String userId
    ) {
        LikeStatusResponse response = likeService.unlikeVideo(videoId, UUID.fromString(userId));
        return ResponseEntity.ok(response);
    }

    // Public endpoint: uses Principal because @AuthenticationPrincipal resolves to "anonymousUser"
    // for anonymous requests, while Principal is null
    @GetMapping("/{videoId}/like")
    public ResponseEntity<LikeStatusResponse> getLikeStatus(
            @PathVariable UUID videoId,
            Principal principal
    ) {
        UUID userId = principal == null ? null : UUID.fromString(principal.getName());
        LikeStatusResponse response = likeService.getLikeStatus(videoId, userId);
        return ResponseEntity.ok(response);
    }
}
