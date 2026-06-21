package com.kyyros.controller;

import com.kyyros.dto.CommentResponse;
import com.kyyros.dto.CommentSummaryResponse;
import com.kyyros.dto.CreateReplyRequest;
import com.kyyros.dto.UpdateCommentRequest;
import com.kyyros.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/comments")
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{commentId}/replies")
    public ResponseEntity<CommentResponse> createReply(
            @PathVariable UUID commentId,
            @Valid @RequestBody CreateReplyRequest request,
            @AuthenticationPrincipal String userId
    ) {
        CommentResponse response = commentService.createReply(commentId, request, UUID.fromString(userId));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentSummaryResponse> updateComment(
            @PathVariable UUID commentId,
            @Valid @RequestBody UpdateCommentRequest request,
            @AuthenticationPrincipal String userId
    ) {
        CommentSummaryResponse response = commentService.updateComment(commentId, request, UUID.fromString(userId));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal String useId
    ) {
        commentService.deleteComment(commentId, UUID.fromString(useId));
        return ResponseEntity.noContent().build();
    }
}