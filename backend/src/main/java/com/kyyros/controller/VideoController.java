package com.kyyros.controller;

import com.kyyros.dto.CreateVideoRequest;
import com.kyyros.dto.CreateVideoResponse;
import com.kyyros.dto.UpdateVideoStatusRequest;
import com.kyyros.service.VideoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/videos")
public class VideoController {

    private final VideoService videoService;

    @PostMapping
    public ResponseEntity<CreateVideoResponse> initiateUpload(
            @Valid @RequestBody CreateVideoRequest request,
            @AuthenticationPrincipal String userId
    ) {

        CreateVideoResponse response = videoService.initiateUpload(request, UUID.fromString(userId));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
}
