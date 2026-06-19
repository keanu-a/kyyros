package com.kyyros.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 404 - Resource not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(HttpStatus.NOT_FOUND.value(), e.getMessage()));
    }

    // 400 - @Valid failures on request bodies
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), message));
    }

    // 400 — malformed/missing JSON body
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableBody(HttpMessageNotReadableException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "Malformed or missing request body"));
    }

    // 403 — access denied thrown from controller or service
    @ExceptionHandler(ForbiddenOperationException.class)
    public ResponseEntity<ErrorResponse> handleForbiddenOperation(ForbiddenOperationException e) {
        log.warn("Forbidden operation: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.of(HttpStatus.FORBIDDEN.value(), e.getMessage()));
    }

    // 502 - bad gateway
    @ExceptionHandler(MuxIntegrationException.class)
    public ResponseEntity<ErrorResponse> handleMuxIntegration(MuxIntegrationException e) {
        log.error("Mux integration error", e);
        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(ErrorResponse.of(HttpStatus.BAD_GATEWAY.value(), "Video processing service unavailable"));
    }

    // 500 - catch-all for anything unexpected
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception e) {
        log.error("Unhandled exception", e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal server error"));
    }
}
