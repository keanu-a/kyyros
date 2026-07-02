package com.kyyros.service;

import com.kyyros.dto.UserSummary;
import com.kyyros.exception.ResourceNotFoundException;
import com.kyyros.model.User;
import com.kyyros.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    public UserSummary getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        return new UserSummary(
                user.getId(),
                user.getUsername(),
                user.getProfilePictureUrl()
        );
    }
}
