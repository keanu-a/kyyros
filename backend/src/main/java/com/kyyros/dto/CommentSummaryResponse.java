package com.kyyros.dto;

import java.time.Instant;
import java.util.UUID;

public record CommentSummaryResponse(
        UUID id,
        String content,
        Double timestampSeconds,
        CommentResponse.UserSummary user,
        Instant createdAt,
        Instant updatedAt
) {
}
