package org.alouastudios.videoplatform.service;

import lombok.RequiredArgsConstructor;
import org.alouastudios.videoplatform.model.S3PresignedResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    @Value("${aws.s3.bucket}")
    private String bucketName;

    private final S3Presigner presigner;

    public S3PresignedResult generatePresignedPutUrl(String fileName) {
        String s3Key = "videos/" + UUID.randomUUID().toString() + "-" + fileName;
        String contentType = "video/mp4"; // TODO: Consider accepting this as parameter rather than hardcoded

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .contentType(contentType)
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

}
