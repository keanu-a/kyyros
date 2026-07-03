package com.kyyros.dto;

import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(min = 2, max = 20, message = "Username must be between 2 and 20 characters")
        String username,
        String profilePictureUrl
) {
}
