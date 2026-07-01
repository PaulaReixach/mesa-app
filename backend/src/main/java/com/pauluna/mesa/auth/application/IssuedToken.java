package com.pauluna.mesa.auth.application;

import java.time.Instant;

public record IssuedToken(
        String value,
        Instant expiresAt
) {
}