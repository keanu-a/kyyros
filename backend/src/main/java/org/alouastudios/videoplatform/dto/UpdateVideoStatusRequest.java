package org.alouastudios.videoplatform.dto;

import jakarta.validation.constraints.NotNull;
import org.alouastudios.videoplatform.enums.VideoStatus;

public record UpdateVideoStatusRequest(
        @NotNull(message = "Video status is required")
        VideoStatus videoStatus
) {
}
