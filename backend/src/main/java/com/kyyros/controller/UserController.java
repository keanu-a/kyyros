package com.kyyros.controller;

import com.kyyros.dto.UpdateCommentRequest;
import com.kyyros.dto.UpdateUserRequest;
import com.kyyros.dto.UserSummary;
import com.kyyros.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserSummary> getCurrentUser(
            @AuthenticationPrincipal String userId
    ) {
        UserSummary response = userService.getCurrentUser(UUID.fromString(userId));
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    public ResponseEntity<UserSummary> updateCurrentUser(
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal String userId
    ) {
        UserSummary response = userService.updateUser(request, UUID.fromString(userId));
        return ResponseEntity.ok(response);
    }
}
