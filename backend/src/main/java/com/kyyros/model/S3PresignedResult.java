package com.kyyros.model;

public record S3PresignedResult(
        String presignedUrl,
        String s3Key
) {
}
