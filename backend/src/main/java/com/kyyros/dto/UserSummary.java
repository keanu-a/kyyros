package com.kyyros.dto;

import java.util.UUID;

public record UserSummary(
        UUID id,
        String username,
        String profilePictureUrl
) {}