package com.pauluna.mesa.group.api;

import java.util.UUID;

import com.pauluna.mesa.user.domain.User;

public record GroupInvitationUserResponse(
        UUID userId,
        String name,
        String username,
        String avatarUrl
) {

    public static GroupInvitationUserResponse from(User user) {
        return new GroupInvitationUserResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getAvatarUrl()
        );
    }
}
