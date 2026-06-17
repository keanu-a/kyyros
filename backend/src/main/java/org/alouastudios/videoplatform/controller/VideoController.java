package org.alouastudios.videoplatform.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.alouastudios.videoplatform.dto.*;
import org.alouastudios.videoplatform.service.VideoService;
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
    public ResponseEntity<CreateVideoResponse> createVideo(
            @Valid @RequestBody CreateVideoRequest request,
            @AuthenticationPrincipal String userId
    ) {

        CreateVideoResponse response = videoService.createVideo(request, UUID.fromString(userId));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateVideo(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateVideoStatusRequest request,
            @AuthenticationPrincipal String userId
    ) {

        videoService.updateVideoStatus(id, request, UUID.fromString(userId));

        return ResponseEntity.noContent().build();
    }
}
