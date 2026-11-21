package com.kyyros.service;

import com.kyyros.dto.UpdateVideoStatusRequest;
import com.kyyros.enums.VideoStatus;
import com.kyyros.exception.BadRequestException;
import com.kyyros.exception.ForbiddenOperationException;
import com.kyyros.exception.MuxIntegrationException;
import com.kyyros.exception.ResourceNotFoundException;
import com.kyyros.model.User;
import com.kyyros.model.Video;
import com.kyyros.repository.UserRepository;
import com.kyyros.repository.VideoLikeRepository;
import com.kyyros.repository.VideoRepository;
import com.mux.sdk.models.Asset;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VideoServiceTest {

    private static final UUID VIDEO_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID OWNER_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID OTHER_USER_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");
    private static final String S3_KEY = "videos/test-video.mp4";
    private static final String TITLE = "Test Video";
    private static final String PRESIGNED_GET_URL = "https://s3.example.com/videos/test-video.mp4?signed";
    private static final String MUX_ASSET_ID = "mux-asset-123";

    private static final long MIN_SIZE = 1024L; // 1 KB
    private static final long MAX_SIZE = 2L * 1024 * 1024 * 1024; // 2 GB

    @Mock
    private S3Service s3Service;

    @Mock
    private MuxService muxService;

    @Mock
    private VideoRepository videoRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VideoLikeRepository videoLikeRepository;

    @InjectMocks
    private VideoService videoService;

    @Nested
    class ProcessStatusUpdate {

        private static final UpdateVideoStatusRequest UPLOADED_REQUEST =
                new UpdateVideoStatusRequest(VideoStatus.UPLOADED);

        // --- Guard clauses ---

        @Test
        void videoNotFound_throwsResourceNotFound() {
            when(videoRepository.findById(VIDEO_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> videoService.processStatusUpdate(VIDEO_ID, UPLOADED_REQUEST, OWNER_ID))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Video not found");

            verifyNoInteractions(s3Service, muxService);
        }

        @Test
        void notOwner_throwsForbidden() {
            when(videoRepository.findById(VIDEO_ID)).thenReturn(Optional.of(pendingVideo()));

            assertThatThrownBy(() -> videoService.processStatusUpdate(VIDEO_ID, UPLOADED_REQUEST, OTHER_USER_ID))
                    .isInstanceOf(ForbiddenOperationException.class);

            verifyNoInteractions(s3Service, muxService);
            verify(videoRepository, never()).save(any());
        }

        @Test
        void notOwnerWithInvalidStatus_throwsForbiddenBeforeBadRequest() {
            // Both the ownership and status guards would fail here; ownership must win
            // so non-owners learn nothing about the video's state
            Video video = pendingVideo();
            video.setStatus(VideoStatus.READY);
            when(videoRepository.findById(VIDEO_ID)).thenReturn(Optional.of(video));

            UpdateVideoStatusRequest badRequest = new UpdateVideoStatusRequest(VideoStatus.READY);

            assertThatThrownBy(() -> videoService.processStatusUpdate(VIDEO_ID, badRequest, OTHER_USER_ID))
                    .isInstanceOf(ForbiddenOperationException.class);
        }

        @ParameterizedTest
        @EnumSource(value = VideoStatus.class, mode = EnumSource.Mode.EXCLUDE, names = "UPLOADED")
        void requestedStatusNotUploaded_throwsBadRequest(VideoStatus requestedStatus) {
            when(videoRepository.findById(VIDEO_ID)).thenReturn(Optional.of(pendingVideo()));

            UpdateVideoStatusRequest request = new UpdateVideoStatusRequest(requestedStatus);

            assertThatThrownBy(() -> videoService.processStatusUpdate(VIDEO_ID, request, OWNER_ID))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("status transition");

            verifyNoInteractions(s3Service, muxService);
        }

        @ParameterizedTest
        @EnumSource(value = VideoStatus.class, mode = EnumSource.Mode.EXCLUDE, names = "PENDING")
        void videoNotPending_throwsBadRequest(VideoStatus currentStatus) {
            Video video = pendingVideo();
            video.setStatus(currentStatus);
            when(videoRepository.findById(VIDEO_ID)).thenReturn(Optional.of(video));

            assertThatThrownBy(() -> videoService.processStatusUpdate(VIDEO_ID, UPLOADED_REQUEST, OWNER_ID))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("PENDING");

            verifyNoInteractions(s3Service, muxService);
        }

        @Test
        void s3ObjectMissing_throwsResourceNotFound() {
            when(videoRepository.findById(VIDEO_ID)).thenReturn(Optional.of(pendingVideo()));
            when(s3Service.objectExists(S3_KEY)).thenReturn(false);

            assertThatThrownBy(() -> videoService.processStatusUpdate(VIDEO_ID, UPLOADED_REQUEST, OWNER_ID))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Upload not found");

            verify(s3Service, never()).getObjectSize(anyString());
            verifyNoInteractions(muxService);
            verify(videoRepository, never()).save(any());
        }

        // --- Size validation ---

        @ParameterizedTest
        @ValueSource(longs = {0L, MIN_SIZE - 1, MAX_SIZE + 1})
        void sizeOutOfRange_deletesObjectAndVideo_throwsBadRequest(long fileSize) {
            Video video = pendingVideo();
            when(videoRepository.findById(VIDEO_ID)).thenReturn(Optional.of(video));
            when(s3Service.objectExists(S3_KEY)).thenReturn(true);
            when(s3Service.getObjectSize(S3_KEY)).thenReturn(fileSize);

            assertThatThrownBy(() -> videoService.processStatusUpdate(VIDEO_ID, UPLOADED_REQUEST, OWNER_ID))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("size");

            verify(s3Service).deleteObject(S3_KEY);
            verify(videoRepository).delete(video);
            verifyNoInteractions(muxService);
            verify(videoRepository, never()).save(any());
        }

        @ParameterizedTest
        @ValueSource(longs = {MIN_SIZE, MAX_SIZE})
        void sizeExactlyAtLimit_isAccepted(long fileSize) {
            Video video = pendingVideo();
            when(videoRepository.findById(VIDEO_ID)).thenReturn(Optional.of(video));
            when(s3Service.objectExists(S3_KEY)).thenReturn(true);
            when(s3Service.getObjectSize(S3_KEY)).thenReturn(fileSize);
            when(s3Service.generatePresignedGetUrl(S3_KEY)).thenReturn(PRESIGNED_GET_URL);
            when(muxService.createAsset(any(), any(), any(), any())).thenReturn(muxAsset());

            videoService.processStatusUpdate(VIDEO_ID, UPLOADED_REQUEST, OWNER_ID);

            assertThat(video.getStatus()).isEqualTo(VideoStatus.PROCESSING);
            verify(s3Service, never()).deleteObject(anyString());
            verify(videoRepository, never()).delete(any());
        }

        // --- Happy path and post-validation failures ---

        @Test
        void validUpload_createsMuxAssetAndMarksProcessing() {
            Video video = pendingVideo();
            stubValidUpload(video);
            when(muxService.createAsset(PRESIGNED_GET_URL, TITLE, OWNER_ID, VIDEO_ID)).thenReturn(muxAsset());

            videoService.processStatusUpdate(VIDEO_ID, UPLOADED_REQUEST, OWNER_ID);

            assertThat(video.getMuxAssetId()).isEqualTo(MUX_ASSET_ID);
            assertThat(video.getStatus()).isEqualTo(VideoStatus.PROCESSING);

            // Tags must be removed only after the video is saved
            InOrder order = inOrder(videoRepository, s3Service);
            order.verify(videoRepository).save(video);
            order.verify(s3Service).removeAllTags(S3_KEY);
        }

        @Test
        void removeAllTagsThrows_isSwallowedAndVideoStillSaved() {
            Video video = pendingVideo();
            stubValidUpload(video);
            when(muxService.createAsset(any(), any(), any(), any())).thenReturn(muxAsset());
            doThrow(new RuntimeException("S3 tagging failed")).when(s3Service).removeAllTags(S3_KEY);

            assertThatCode(() -> videoService.processStatusUpdate(VIDEO_ID, UPLOADED_REQUEST, OWNER_ID))
                    .doesNotThrowAnyException();

            assertThat(video.getStatus()).isEqualTo(VideoStatus.PROCESSING);
            verify(videoRepository).save(video);
        }

        @Test
        void muxCreateAssetThrows_propagatesAndLeavesVideoPending() {
            Video video = pendingVideo();
            stubValidUpload(video);
            when(muxService.createAsset(any(), any(), any(), any()))
                    .thenThrow(new MuxIntegrationException("Failed to create Mux asset."));

            assertThatThrownBy(() -> videoService.processStatusUpdate(VIDEO_ID, UPLOADED_REQUEST, OWNER_ID))
                    .isInstanceOf(MuxIntegrationException.class);

            assertThat(video.getStatus()).isEqualTo(VideoStatus.PENDING);
            assertThat(video.getMuxAssetId()).isNull();
            verify(videoRepository, never()).save(any());
            verify(s3Service, never()).removeAllTags(anyString());
        }

        // Stubs everything up to (but not including) the Mux call for a valid, in-range upload
        private void stubValidUpload(Video video) {
            when(videoRepository.findById(VIDEO_ID)).thenReturn(Optional.of(video));
            when(s3Service.objectExists(S3_KEY)).thenReturn(true);
            when(s3Service.getObjectSize(S3_KEY)).thenReturn(10L * 1024 * 1024); // 10 MB
            when(s3Service.generatePresignedGetUrl(S3_KEY)).thenReturn(PRESIGNED_GET_URL);
        }
    }

    private static Video pendingVideo() {
        User owner = new User();
        owner.setId(OWNER_ID);
        owner.setUsername("owner");

        Video video = new Video();
        video.setId(VIDEO_ID);
        video.setUploader(owner);
        video.setTitle(TITLE);
        video.setS3Key(S3_KEY);
        video.setStatus(VideoStatus.PENDING);
        return video;
    }

    private static Asset muxAsset() {
        Asset asset = new Asset();
        asset.setId(MUX_ASSET_ID);
        return asset;
    }
}
