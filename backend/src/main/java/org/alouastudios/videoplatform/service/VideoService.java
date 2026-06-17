package org.alouastudios.videoplatform.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.alouastudios.videoplatform.dto.CreateVideoRequest;
import org.alouastudios.videoplatform.dto.CreateVideoResponse;
import org.alouastudios.videoplatform.dto.UpdateVideoStatusRequest;
import org.alouastudios.videoplatform.model.S3PresignedResult;
import org.alouastudios.videoplatform.model.Video;
import org.alouastudios.videoplatform.repository.VideoRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final S3Service s3Service;
    private final VideoRepository videoRepository;

    @Transactional
    public CreateVideoResponse createVideo(CreateVideoRequest request, UUID userId) {
        S3PresignedResult s3Result = s3Service.generatePresignedUrl(request.fileName());

        Video video = new Video();
        video.setTitle(request.title());
        video.setDescription(request.description());
        video.setUserId(userId);
        video.setS3Key(s3Result.s3Key());

        Video savedVideo = videoRepository.save(video);

        return new CreateVideoResponse(
                savedVideo.getId(),
                s3Result.presignedUrl(),
                s3Result.s3Key()
        );
    }

    @Transactional
    public void updateVideoStatus(UUID videoId, UpdateVideoStatusRequest request, UUID userId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new EntityNotFoundException("Video not found: " + videoId));

        if (!video.getUserId().equals(userId)) {
            throw new SecurityException("You do not have permission to update this video");
        }

        video.setStatus(request.videoStatus());
        videoRepository.save(video);
    }
}
