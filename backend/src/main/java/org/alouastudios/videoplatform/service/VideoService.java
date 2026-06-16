package org.alouastudios.videoplatform.service;

import lombok.RequiredArgsConstructor;
import org.alouastudios.videoplatform.dto.PresignedUrlRequest;
import org.alouastudios.videoplatform.dto.PresignedUrlResponse;
import org.alouastudios.videoplatform.model.S3PresignedResult;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final S3Service s3Service;

    public PresignedUrlResponse generateUploadUrl(PresignedUrlRequest request) {
        S3PresignedResult result = s3Service.generatePresignedUrl(request.fileName());

        return new PresignedUrlResponse(
                result.presignedPutObjectRequest(),
                result.s3Key()
        );
    }
}
