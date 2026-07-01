package com.pauluna.mesa.auth.api;

import java.time.Instant;

import com.pauluna.mesa.user.api.UserResponse;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt,
        UserResponse user
) {
}