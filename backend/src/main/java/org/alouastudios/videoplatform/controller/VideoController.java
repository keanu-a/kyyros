package org.alouastudios.videoplatform.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.alouastudios.videoplatform.dto.PresignedUrlRequest;
import org.alouastudios.videoplatform.dto.PresignedUrlResponse;
import org.alouastudios.videoplatform.service.VideoService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/v1/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    @PostMapping("/presigned-url")
    public ResponseEntity<PresignedUrlResponse> getPresignedUrl(
            @Valid @RequestBody PresignedUrlRequest request
    ) {
        PresignedUrlResponse response = videoService.generateUploadUrl(request);
        return ResponseEntity.ok().body(response);
    }
}
