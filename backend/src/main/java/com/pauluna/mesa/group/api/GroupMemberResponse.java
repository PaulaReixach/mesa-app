package com.pauluna.mesa.group.api;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.group.domain.GroupMember;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.user.domain.User;

public record GroupMemberResponse(
        UUID id,
        UUID userId,
        String name,
        String username,
        String avatarUrl,
        GroupRole role,
        Instant joinedAt
) {

    public static GroupMemberResponse from(
            GroupMember groupMember,
            User user
    ) {
        return new GroupMemberResponse(
                groupMember.getId(),
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getAvatarUrl(),
                groupMember.getRole(),
                groupMember.getJoinedAt()
        );
    }
}