package com.kyyros.exception;

public class RateLimitExceedException extends RuntimeException {

    private final long retryAfterSeconds;

    public RateLimitExceedException(String limitName, long retryAfterSeconds) {
        super("Rate limit exceeded for: " + limitName);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
