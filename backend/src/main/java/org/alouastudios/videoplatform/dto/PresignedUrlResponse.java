package org.alouastudios.videoplatform.dto;

public record PresignedUrlResponse(
        String presignedUrl,
        String s3Key
) {
}
