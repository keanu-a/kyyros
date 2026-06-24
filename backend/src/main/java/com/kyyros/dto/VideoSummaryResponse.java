package com.kyyros.dto;

import java.time.Instant;
import java.util.UUID;

public record VideoSummaryResponse(
        UUID id,
        String title,
        String thumbnailUrl,
        String uploaderUsername,
        Instant createdAt
) {
}
