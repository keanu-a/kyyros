package com.kyyros.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateVideoRequest(
        @NotBlank(message = "Video title is required")
        @Size(max = 255, message = "Video title must be 255 characters or less")
        String title,

        @Size(max = 5000, message = "Video description must be 5000 characters or less")
        String description,

        @NotBlank(message = "Video file name is required")
        String fileName
) {
}
