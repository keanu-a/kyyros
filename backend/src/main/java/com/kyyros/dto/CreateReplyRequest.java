package com.kyyros.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateReplyRequest(
        @NotBlank(message = "Content cannot be blank")
        String content
) {
}
