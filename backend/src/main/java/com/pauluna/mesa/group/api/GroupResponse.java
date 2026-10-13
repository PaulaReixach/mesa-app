package com.pauluna.mesa.group.api;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.group.domain.RestaurantGroup;

public record GroupResponse(
        UUID id,
        String name,
        String description,
        String imageUrl,
        String city,
        GroupPrivacy privacy,
        boolean acceptingCollaborators,
        GroupRole currentUserRole,
        long followerCount,
        UUID ownerUserId,
        Instant createdAt,
        Instant updatedAt,
        /** News by others since the current member last opened the group. */
        long unseenCount
) {

    public static GroupResponse from(RestaurantGroup restaurantGroup) {
        return from(restaurantGroup, null, 0);
    }

    public static GroupResponse from(
            RestaurantGroup restaurantGroup,
            GroupRole currentUserRole
    ) {
        return from(restaurantGroup, currentUserRole, 0);
    }

    public static GroupResponse from(
            RestaurantGroup restaurantGroup,
            GroupRole currentUserRole,
            long followerCount
    ) {
        return from(restaurantGroup, currentUserRole, followerCount, 0);
    }

    public static GroupResponse from(
            RestaurantGroup restaurantGroup,
            GroupRole currentUserRole,
            long followerCount,
            long unseenCount
    ) {
        return new GroupResponse(
                restaurantGroup.getId(),
                restaurantGroup.getName(),
                restaurantGroup.getDescription(),
                restaurantGroup.getImageUrl(),
                restaurantGroup.getCity(),
                restaurantGroup.getPrivacy(),
                restaurantGroup.isAcceptingCollaborators(),
                currentUserRole,
                followerCount,
                restaurantGroup.getOwnerUserId(),
                restaurantGroup.getCreatedAt(),
                restaurantGroup.getUpdatedAt(),
                unseenCount
        );
    }
}
