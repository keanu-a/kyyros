package org.alouastudios.videoplatform.model;

public record S3PresignedResult(
        String presignedUrl,
        String s3Key
) {
}
