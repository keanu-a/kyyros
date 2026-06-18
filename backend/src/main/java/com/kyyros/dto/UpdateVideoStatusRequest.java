package com.kyyros.dto;

import com.kyyros.enums.VideoStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateVideoStatusRequest(
        @NotNull(message = "Video status is required")
        VideoStatus videoStatus
) {
}
