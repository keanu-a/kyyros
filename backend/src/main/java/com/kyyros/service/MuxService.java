package com.kyyros.service;

import com.kyyros.exception.MuxIntegrationException;
import com.mux.ApiClient;
import com.mux.ApiException;
import com.mux.sdk.AssetsApi;
import com.mux.sdk.models.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MuxService {

    private final ApiClient apiClient;

    /**
     * Tells Mux to download the video from the given URL and start transcoding
     *
     * @param sourceUrl Publicly accessible URL
     * @return The created Mux asset
     */
    public Asset createAsset(String sourceUrl, String title, UUID userId, UUID videoId) {
        AssetsApi assetsApi = new AssetsApi(apiClient);

        AssetMetadata metadata = new AssetMetadata()
                .title(title)
                .creatorId(userId.toString())
                .externalId(videoId.toString());

        CreateAssetRequest createAssetRequest = new CreateAssetRequest()
                .input(List.of(new InputSettings().url(sourceUrl)))
                .playbackPolicies(List.of(PlaybackPolicy.PUBLIC))
                .meta(metadata);

        try {
            AssetResponse assetResponse = assetsApi.createAsset(createAssetRequest).execute();
            Asset asset = assetResponse.getData();

            if (asset == null) {
                throw new MuxIntegrationException("Mux returned empty response");
            }

            log.info("Created Mux asset: {}", asset.getId());
            return asset;
        } catch (ApiException e) {
            log.error("Failed to create Mux asset: Status={}, Body={}", e.getCode(), e.getResponseBody());
            throw new MuxIntegrationException("Failed to create Mux asset.", e);
        }
    }

    public void deleteAsset(String assetId) {
        AssetsApi assetsApi = new AssetsApi(apiClient);

        try {
            assetsApi.deleteAsset(assetId).execute();
            log.info("Deleted Mux asset: {}", assetId);
        } catch (ApiException e) {
            log.error("Failed to delete Mux asset: Status={}, Body={}", e.getCode(), e.getResponseBody());
            throw new MuxIntegrationException("Failed to delete Mux asset.", e);
        }
    }
}
