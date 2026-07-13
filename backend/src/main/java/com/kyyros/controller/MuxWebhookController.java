package com.kyyros.controller;

import lombok.RequiredArgsConstructor;
import com.kyyros.dto.MuxWebhookPayload;
import com.kyyros.service.VideoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.thirdparty.jackson.core.JsonProcessingException;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/webhooks/mux")
public class MuxWebhookController {

    private final VideoService videoService;
    private final ObjectMapper objectMapper;

    @Value("${mux.webhook.secret}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<Void> handleMuxWebhook(
            @RequestBody String rawBody,
            @RequestHeader("Mux-Signature") String muxSignatureHeader
    ) {

        if (!isValidSignature(rawBody, muxSignatureHeader)) {
            log.warn("Mux signature is invalid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        MuxWebhookPayload payload;
        payload = objectMapper.readValue(rawBody, MuxWebhookPayload.class);

        videoService.handleMuxWebhook(payload);
        return ResponseEntity.ok().build();
    }

    private boolean isValidSignature(String rawBody, String muxSignatureHeader) {

        // Step 1: Extract the timestamp and signature
        Map<String, String> splitHeader = new HashMap<>();
        for (String headerPart : muxSignatureHeader.split(",")) {
            String[] keyValue = headerPart.split("=");
            splitHeader.put(keyValue[0].trim(), keyValue[1].trim());
        }

        String timestamp = splitHeader.get("t");
        String signature = splitHeader.get("v1");

        if (timestamp == null || signature == null) return false;

        // Step 2: Prepare the signed_payload string
        String signedPayload = timestamp + "." + rawBody;

        // Step 3: Determine the expected signature
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] computedHash = mac.doFinal(signedPayload.getBytes(StandardCharsets.UTF_8));
            String computedSignature = HexFormat.of().formatHex(computedHash);

            // Step 4: Compare signatures
            return MessageDigest.isEqual(
                    computedSignature.getBytes(StandardCharsets.UTF_8),
                    signedPayload.getBytes(StandardCharsets.UTF_8)
            );
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error computing Mux webhook signature");
            return false;
        }

    }
}
