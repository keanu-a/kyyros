package com.kyyros.service;

import com.kyyros.dto.*;
import com.kyyros.enums.VideoStatus;
import com.kyyros.exception.BadRequestException;
import com.kyyros.exception.ForbiddenOperationException;
import com.kyyros.exception.ResourceNotFoundException;
import com.kyyros.model.S3PresignedResult;
import com.kyyros.model.User;
import com.kyyros.repository.UserRepository;
import com.kyyros.repository.VideoRepository;
import com.mux.sdk.models.Asset;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.kyyros.model.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoService {

    private static final long MAX_UPLOAD_SIZE_BYTES = 2L * 1024 * 1024 * 1024; // 2 GB
    private static final long MIN_UPLOAD_SIZE_BYTES = 1024; // 1 KB (rejects empty/near-empty files)

    private final S3Service s3Service;
    private final MuxService muxService;

    private final VideoRepository videoRepository;
    private final UserRepository userRepository;

    @Transactional
    public CreateVideoResponse initiateUpload(CreateVideoRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found" + userId));

        S3PresignedResult s3Result = s3Service.generatePresignedPutUrl(request.fileName(), request.contentType());

        Video video = new Video();
        video.setTitle(request.title());
        video.setDescription(request.description());
        video.setUploader(user);
        video.setS3Key(s3Result.s3Key());

        Video savedVideo = videoRepository.save(video);

        return new CreateVideoResponse(
                savedVideo.getId(),
                s3Result.presignedUrl(),
                s3Result.s3Key()
        );
    }

    // Update status from PENDING to UPLOADED
    @Transactional
    public void processStatusUpdate(UUID videoId, UpdateVideoStatusRequest request, UUID userId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found: " + videoId));

        if (!video.getUploader().getId().equals(userId)) {
            throw new ForbiddenOperationException("You do not have permission to update this video");
        }

        if (request.videoStatus() != VideoStatus.UPLOADED) {
            throw new BadRequestException("Invalid status transition");
        }

        if (video.getStatus() != VideoStatus.PENDING) {
            throw new BadRequestException("Video is not in PENDING state");
        }

        // Verify the file actually exists in S3 before triggering Mux
        if (!s3Service.objectExists(video.getS3Key())) {
            throw new ResourceNotFoundException("Upload not found");
        }

        // Validate file size
        long fileSize = s3Service.getObjectSize(video.getS3Key());
        if (fileSize < MIN_UPLOAD_SIZE_BYTES || fileSize > MAX_UPLOAD_SIZE_BYTES) {
            s3Service.deleteObject(video.getS3Key());
            videoRepository.delete(video);
            throw new BadRequestException("Uploaded file size is outside the allowed range");
        }

        // Get presigned GET url for the video
        String presignedGetUrl = s3Service.generatePresignedGetUrl(video.getS3Key());

        // Tell Mux to grab this video from S3
        Asset asset = muxService.createAsset(presignedGetUrl);

        video.setMuxAssetId(asset.getId());
        video.setStatus(VideoStatus.PROCESSING);

        videoRepository.save(video);

        // Remove pending tag so lifecycle rule doesn't delete this object
        try {
            s3Service.removeAllTags(video.getS3Key());
        } catch (Exception e) {
            log.error("Failed to remove tags from S3 object {}: {}", video.getId(), e.getMessage());
        }
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

    @Transactional(readOnly = true)
    public Page<VideoSummaryResponse> getVideos(Pageable pageable) {
        return videoRepository.findReadyVideos(pageable)
                .map(video -> new VideoSummaryResponse(
                        video.getId(),
                        video.getTitle(),
                        "https://image.mux.com/" + video.getMuxPlaybackId() + "/thumbnail.jpg",
                        video.getUploader().getUsername(),
                        video.getCreatedAt()
                ));
    }

    public GetVideoResponse getVideoById(UUID videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found: " + videoId));

        User uploader = video.getUploader();

        return new GetVideoResponse(
                video.getId(),
                video.getTitle(),
                video.getDescription(),
                new UserSummary(
                        uploader.getId(),
                        uploader.getUsername(),
                        uploader.getProfilePictureUrl()
                ),
                video.getStatus(),
                video.getMuxPlaybackId(),
                video.getCreatedAt()
        );
    }
}
