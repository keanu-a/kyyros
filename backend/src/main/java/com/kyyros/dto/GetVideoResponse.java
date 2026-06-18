package com.kyyros.dto;

import com.kyyros.enums.VideoStatus;

import java.time.Instant;
import java.util.UUID;

public record GetVideoResponse(
        UUID id,
        String title,
        VideoStatus status,
        String playbackId,
        Instant createdAt
) {
}
