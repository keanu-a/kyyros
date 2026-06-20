package com.kyyros.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateCommentRequest(
        @NotBlank(message = "Content cannot be blank")
        String content
) {
}
