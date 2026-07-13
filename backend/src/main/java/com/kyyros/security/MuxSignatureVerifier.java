package com.kyyros.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;

@Component
@Slf4j
public class MuxSignatureVerifier {

    private final String webhookSecret;

    public MuxSignatureVerifier(@Value("${mux.webhook.secret}") String webhookSecret) {
        this.webhookSecret = webhookSecret;
    }

    public boolean verify(String rawBody, String signatureHeader) {
        if (signatureHeader == null || signatureHeader.isBlank()) {
            return false;
        }

        // Step 1: Extract the timestamp and signature
        Map<String, String> parts = parseSignatureHeader(signatureHeader);
        String timestamp = parts.get("t");
        String expectedSignature = parts.get("v1");

        if (timestamp == null || expectedSignature == null) {
            return false;
        }

        // Step 2: Prepare the signed_payload string
        String signedPayload = timestamp + "." + rawBody;

        // Step 3: Determine the expected signature
        String computedSignature = computeHmacSha256(signedPayload);

        if (computedSignature == null) {
            return false;
        }

        // Step 4: Compare signatures
        return MessageDigest.isEqual(
                computedSignature.getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8)
        );
    }

    private Map<String, String> parseSignatureHeader(String signatureHeader) {
        Map<String, String> parts = new HashMap<>();
        for (String part : signatureHeader.split(",")) {
            String[] kv = part.split("=", 2);
            if (kv.length == 2) {
                parts.put(kv[0].trim(), kv[1].trim());
            }
        }
        return parts;
    }

    private String computeHmacSha256(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error computing HMAC-SHA256", e);
            return null;
        }
    }
}