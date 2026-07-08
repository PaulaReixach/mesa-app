package com.pauluna.mesa.group.api;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.group.domain.GroupInvitation;
import com.pauluna.mesa.group.domain.GroupInvitationStatus;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.user.domain.User;

public record GroupInvitationResponse(
        UUID id,
        UUID groupId,
        String groupName,
        GroupPrivacy groupPrivacy,
        GroupInvitationUserResponse invitedUser,
        GroupInvitationUserResponse invitedBy,
        GroupInvitationStatus status,
        Instant createdAt,
        Instant updatedAt
) {

    public static GroupInvitationResponse from(
            GroupInvitation invitation,
            RestaurantGroup group,
            User invitedUser,
            User invitedBy
    ) {
        return new GroupInvitationResponse(
                invitation.getId(),
                group.getId(),
                group.getName(),
                group.getPrivacy(),
                GroupInvitationUserResponse.from(invitedUser),
                GroupInvitationUserResponse.from(invitedBy),
                invitation.getStatus(),
                invitation.getCreatedAt(),
                invitation.getUpdatedAt()
        );
    }
}
