package com.kyyros.dto;

public record LikeStatusResponse(
        long likeCount,
        boolean likedByMe
) {
}
