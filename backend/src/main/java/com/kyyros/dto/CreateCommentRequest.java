package com.kyyros.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateCommentRequest(

        @NotBlank(message = "Content cannot be blank")
        String content,

        @NotNull(message = "Timestamp is required")
        @PositiveOrZero(message = "Timestamp must be 0 or positive")
        Double timestampSeconds
) {
}
