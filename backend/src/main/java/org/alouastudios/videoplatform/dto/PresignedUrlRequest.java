package org.alouastudios.videoplatform.dto;

import jakarta.validation.constraints.NotBlank;

public record PresignedUrlRequest(
        @NotBlank(message = "File name is required")
        String fileName
) {
}
