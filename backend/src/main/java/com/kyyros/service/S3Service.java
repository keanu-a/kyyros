package com.kyyros.service;

import com.kyyros.exception.BadRequestException;
import com.kyyros.model.S3PresignedResult;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    @Value("${aws.s3.bucket}")
    private String bucketName;

    private final S3Presigner presigner;
    private final S3Client s3Client;

    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
            "video/mp4",
            "video/quicktime",  // .mov
            "video/webm",
            "video/x-matroska", // .mkv
            "video/x-msvideo"   // .avi
    );

    public S3PresignedResult generatePresignedPutUrl(String fileName, String contentType) {
        // Validating if video is in supported format
        if (contentType == null || !ALLOWED_VIDEO_TYPES.contains(contentType)) {
            throw new BadRequestException(
                    "Unsupported video content type. Allowed: " + String.join(", ", ALLOWED_VIDEO_TYPES)
            );
        }

        String safeFileName = sanitizeFileName(fileName);
        String s3Key = "videos/" + UUID.randomUUID() + "-" + safeFileName;

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .contentType(contentType)
                .tagging("pending=true")
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedPutObjectRequest = presigner.presignPutObject(presignRequest);

        return new S3PresignedResult(presignedPutObjectRequest.url().toString(), s3Key);
    }

    public String generatePresignedGetUrl(String s3Key) {
        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key).build();

        GetObjectPresignRequest presignedRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(1))
                .getObjectRequest(objectRequest).build();

        PresignedGetObjectRequest presignedGetObjectRequest = presigner.presignGetObject(presignedRequest);

        return presignedGetObjectRequest.url().toString();
    }

    /**
     * Checks whether an object exists in the S3 bucket.
     * Uses a HEAD request — cheap, no body transfer.
     */
    public boolean objectExists(String s3Key) {
        try {
            s3Client.headObject(HeadObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                    .build());
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        }
    }

    /**
     * Sanitizes a user provided file name for safe use in S3 keys.
     * - Replaces non-alphanumeric characters (except . _ -) with underscores
     * - Caps the length at 100 characters
     * - Falls back to "video" if the result is empty
     */
    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "video";
        }

        String safe = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");

        if (safe.length() > 100) {
            safe = safe.substring(0, 100);
        }

        return safe;
    }

    public long getObjectSize(String s3Key) {
        HeadObjectRequest headRequest = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();

        HeadObjectResponse response = s3Client.headObject(headRequest);
        return response.contentLength();
    }

    public void deleteObject(String s3Key) {
        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();

        s3Client.deleteObject(deleteRequest);
    }

    public void removeAllTags(String s3Key) {
        DeleteObjectTaggingRequest deleteRequest = DeleteObjectTaggingRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();

        s3Client.deleteObjectTagging(deleteRequest);
    }
}
