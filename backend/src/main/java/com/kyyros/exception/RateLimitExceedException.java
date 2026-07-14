package com.kyyros.exception;

import lombok.Getter;

@Getter
public class RateLimitExceedException extends RuntimeException {

    private final long retryAfterSeconds;

    public RateLimitExceedException(String limitName, long retryAfterSeconds) {
        super("Rate limit exceeded for: " + limitName);
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
