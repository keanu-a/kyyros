package com.kyyros.dto;

import java.util.UUID;

public record CreateVideoResponse(
        UUID videoId,
        String presignedUrl,
        String s3Key
) {
}
