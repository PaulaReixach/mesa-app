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
        UUID ownerUserId,
        Instant createdAt,
        Instant updatedAt
) {

    public static GroupResponse from(RestaurantGroup restaurantGroup) {
        return from(restaurantGroup, null);
    }

    public static GroupResponse from(
            RestaurantGroup restaurantGroup,
            GroupRole currentUserRole
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
                restaurantGroup.getOwnerUserId(),
                restaurantGroup.getCreatedAt(),
                restaurantGroup.getUpdatedAt()
        );
    }
}
