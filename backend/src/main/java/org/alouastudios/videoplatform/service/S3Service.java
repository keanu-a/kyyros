package org.alouastudios.videoplatform.service;

import lombok.RequiredArgsConstructor;
import org.alouastudios.videoplatform.model.S3PresignedResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
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

    public S3PresignedResult generatePresignedUrl(String fileName) {
        String s3Key = "video/" + UUID.randomUUID().toString() + "-" + fileName;
        String contentType = "video/mp4";

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




}
