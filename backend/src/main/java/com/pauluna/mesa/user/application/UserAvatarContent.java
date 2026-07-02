package com.pauluna.mesa.user.application;

public record UserAvatarContent(
        String contentType,
        byte[] imageData
) {
}