package com.kyyros.controller;

import com.kyyros.security.MuxSignatureVerifier;
import lombok.RequiredArgsConstructor;
import com.kyyros.dto.MuxWebhookPayload;
import com.kyyros.service.VideoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/webhooks/mux")
public class MuxWebhookController {

    private final VideoService videoService;
    private final ObjectMapper objectMapper;
    private final MuxSignatureVerifier muxSignatureVerifier;

    @PostMapping
    public ResponseEntity<Void> handleMuxWebhook(
            @RequestBody String rawBody,
            @RequestHeader("Mux-Signature") String muxSignatureHeader
    ) {

        if (!muxSignatureVerifier.verify(rawBody, muxSignatureHeader)) {
            log.warn("Mux signature is invalid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        MuxWebhookPayload payload;
        payload = objectMapper.readValue(rawBody, MuxWebhookPayload.class);

        videoService.handleMuxWebhook(payload);
        return ResponseEntity.ok().build();
    }
}
