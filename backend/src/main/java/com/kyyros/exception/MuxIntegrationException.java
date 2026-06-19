package com.kyyros.exception;

public class MuxIntegrationException extends RuntimeException {
    public MuxIntegrationException(String message) {
        super(message);
    }

    public MuxIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
