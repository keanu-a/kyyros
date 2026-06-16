package org.alouastudios.videoplatform.model;

public record S3PresignedResult(
        String presignedPutObjectRequest,
        String s3Key
) {
}
