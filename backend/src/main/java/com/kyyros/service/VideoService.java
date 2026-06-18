package com.kyyros.service;

import com.kyyros.dto.*;
import com.kyyros.enums.VideoStatus;
import com.kyyros.model.S3PresignedResult;
import com.kyyros.repository.VideoRepository;
import com.mux.sdk.models.Asset;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.kyyros.model.Video;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoService {

    private final S3Service s3Service;
    private final VideoRepository videoRepository;
    private final MuxService muxService;

    @Transactional
    public CreateVideoResponse initiateUpload(CreateVideoRequest request, UUID userId) {
        S3PresignedResult s3Result = s3Service.generatePresignedPutUrl(request.fileName());

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
    public void processStatusUpdate(UUID videoId, UpdateVideoStatusRequest request, UUID userId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new EntityNotFoundException("Video not found: " + videoId));

        if (!video.getUserId().equals(userId)) {
            throw new SecurityException("You do not have permission to update this video");
        }

        // TODO: Should the client pass in an arbitrary video status?
        video.setStatus(request.videoStatus());

        if (request.videoStatus() == VideoStatus.UPLOADED) {
            String presignedGetUrl = s3Service.generatePresignedGetUrl(video.getS3Key());
            Asset asset = muxService.createAsset(presignedGetUrl);
            video.setMuxAssetId(asset.getId());
            video.setStatus(VideoStatus.PROCESSING);
        }

        videoRepository.save(video);
    }

    @Transactional
    public void handleMuxWebhook(MuxWebhookPayload payload) {
        String assetId = payload.data().id();

        Video video = videoRepository.findByMuxAssetId(assetId).orElse(null);

        // Using logs instead of throwing so Mux isn't retrying forever
        if (video == null) {
            log.warn("Received MuxWebhook but no video found for assetId: {}", assetId);
            return;
        }

        switch (payload.type()) {
            case "video.asset.ready" -> {
                String playbackId = payload.data().playbackIds().getFirst().id();
                video.setMuxPlaybackId(playbackId);
                video.setStatus(VideoStatus.READY);
                log.info("Video {} is now READY with playback ID {}", video.getId(), playbackId);
            }

            case "video.asset.errored" -> {
                video.setStatus(VideoStatus.FAILED);
                log.error("Mux failed to process video {}", video.getId());
            }

            default -> {
                log.debug("Ignoring Mux event type: {}", payload.type());
                return;
            }
        }

        videoRepository.save(video);
    }

    public GetVideoResponse getVideoById(UUID videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new EntityNotFoundException("Video not found: " + videoId));

        return new GetVideoResponse(
                video.getId(),
                video.getTitle(),
                video.getStatus(),
                video.getMuxPlaybackId(),
                video.getCreatedAt()
        );
    }
}
