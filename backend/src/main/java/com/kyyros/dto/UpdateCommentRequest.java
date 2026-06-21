package com.kyyros.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCommentRequest(
        @NotBlank(message = "Content cannot be blank")
        @Size(max = 2500, message = "Content must not exceed 2500 characters")
        String content
) {
}
