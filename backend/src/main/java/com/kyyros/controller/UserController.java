package com.kyyros.controller;

import com.kyyros.dto.UserSummary;
import com.kyyros.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
