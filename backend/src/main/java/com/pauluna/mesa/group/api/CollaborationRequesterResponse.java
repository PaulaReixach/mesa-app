package com.pauluna.mesa.group.api;

import java.util.UUID;

import com.pauluna.mesa.user.domain.User;

public record CollaborationRequesterResponse(
        UUID id,
        String name,
        String username,
        String avatarUrl
) {

    public static CollaborationRequesterResponse from(User user) {
        return new CollaborationRequesterResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getAvatarUrl()
        );
    }
}
