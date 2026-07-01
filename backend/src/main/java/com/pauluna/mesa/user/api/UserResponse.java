package com.pauluna.mesa.user.api;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.user.domain.User;

public record UserResponse(
        UUID id,
        String name,
        String username,
        String email,
        String avatarUrl,
        Instant createdAt,
        Instant updatedAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}