package org.alouastudios.videoplatform.controller;

import lombok.RequiredArgsConstructor;
import org.alouastudios.videoplatform.dto.MuxWebhookPayload;
import org.alouastudios.videoplatform.service.VideoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/webhooks/mux")
public class MuxWebhookController {

    private final VideoService videoService;

    // TODO: Verify Mux webhook signature before processing
    @PostMapping
    public ResponseEntity<Void> handleMuxWebhook(@RequestBody MuxWebhookPayload payload) {
        videoService.handleMuxWebhook(payload);
        return ResponseEntity.ok().build();
    }
}
