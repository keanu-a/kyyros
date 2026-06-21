package com.kyyros.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        String content,
        Double timestampSeconds,
        UserSummary user,
        Instant createdAt,
        Instant updatedAt,
        List<CommentResponse> replies
) {
    public record UserSummary(
            UUID id,
            String username,
            String profilePictureUrl
    ) {}
}
