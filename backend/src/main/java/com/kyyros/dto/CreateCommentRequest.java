package com.kyyros.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(

        @NotBlank(message = "Content cannot be blank")
        @Size(max = 2500, message = "Content must not exceed 2500 characters")
        String content,

        @NotNull(message = "Timestamp is required")
        @PositiveOrZero(message = "Timestamp must be 0 or positive")
        Double timestampSeconds
) {
}
