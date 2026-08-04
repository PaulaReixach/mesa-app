package com.pauluna.mesa.user.api;

import java.util.UUID;

import com.pauluna.mesa.user.domain.User;

public record UserSearchResponse(
        UUID id,
        String name,
        String username,
        String avatarUrl
) {

    public static UserSearchResponse from(
            User user
    ) {
        return new UserSearchResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getAvatarUrl()
        );
    }
}
