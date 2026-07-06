package com.pauluna.mesa.group.api;

import java.util.UUID;

import com.pauluna.mesa.user.domain.User;

public record PublicGroupOwnerResponse(
        UUID id,
        String name,
        String username,
        String avatarUrl
) {

    public static PublicGroupOwnerResponse from(User user) {
        return new PublicGroupOwnerResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getAvatarUrl()
        );
    }
}
