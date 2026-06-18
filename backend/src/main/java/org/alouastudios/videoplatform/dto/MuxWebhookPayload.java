package org.alouastudios.videoplatform.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MuxWebhookPayload(
        String type,
        Data data
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Data(
            String id,
            @JsonProperty("playback_ids") List<PlaybackId> playbackIds,
            String status
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlaybackId(
            String id,
            String policy // "public" or "signed"
    ) {}
}
