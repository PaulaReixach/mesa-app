package com.pauluna.mesa.group.api;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.RestaurantGroup;

public record GroupResponse(
        UUID id,
        String name,
        String description,
        String imageUrl,
        String city,
        GroupPrivacy privacy,
        UUID ownerUserId,
        Instant createdAt,
        Instant updatedAt
) {

    public static GroupResponse from(RestaurantGroup restaurantGroup) {
        return new GroupResponse(
                restaurantGroup.getId(),
                restaurantGroup.getName(),
                restaurantGroup.getDescription(),
                restaurantGroup.getImageUrl(),
                restaurantGroup.getCity(),
                restaurantGroup.getPrivacy(),
                restaurantGroup.getOwnerUserId(),
                restaurantGroup.getCreatedAt(),
                restaurantGroup.getUpdatedAt()
        );
    }
}