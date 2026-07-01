package com.pauluna.mesa.restaurant.api;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;
import com.pauluna.mesa.restaurant.domain.Restaurant;

public record GroupRestaurantResponse(
        UUID id,
        UUID groupId,
        GroupRestaurantStatus status,
        UUID proposedByUserId,
        String groupNotes,
        Instant createdAt,
        Instant updatedAt,
        RestaurantResponse restaurant
) {

    public static GroupRestaurantResponse from(
            GroupRestaurant groupRestaurant,
            Restaurant restaurant
    ) {
        return new GroupRestaurantResponse(
                groupRestaurant.getId(),
                groupRestaurant.getGroupId(),
                groupRestaurant.getStatus(),
                groupRestaurant.getProposedByUserId(),
                groupRestaurant.getGroupNotes(),
                groupRestaurant.getCreatedAt(),
                groupRestaurant.getUpdatedAt(),
                RestaurantResponse.from(restaurant)
        );
    }
}