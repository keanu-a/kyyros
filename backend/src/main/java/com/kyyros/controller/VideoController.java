package com.kyyros.controller;

import com.kyyros.dto.*;
import com.kyyros.service.CommentService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/videos")
public class VideoController {

    private final VideoService videoService;
    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CreateVideoResponse> initiateUpload(
            @Valid @RequestBody CreateVideoRequest request,
            @AuthenticationPrincipal String userId
    ) {

        CreateVideoResponse response = videoService.initiateUpload(request, UUID.fromString(userId));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<VideoSummaryResponse>> getAllVideos(
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<VideoSummaryResponse> response = videoService.getVideos(pageable);
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

    @PostMapping("/{videoId}/comments")
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
}
