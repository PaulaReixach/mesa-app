package com.pauluna.mesa.restaurant.api;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;
import com.pauluna.mesa.restaurant.domain.Restaurant;

public record GroupRestaurantResponse(
        UUID id,
        UUID groupId,
        GroupRestaurantStatus status,
        boolean favorite,
        UUID proposedByUserId,
        String groupNotes,
        Instant createdAt,
        Instant updatedAt,
        BigDecimal averageScore,
        long ratingsCount,
        RestaurantResponse restaurant
) {

    public static GroupRestaurantResponse from(
            GroupRestaurant groupRestaurant,
            Restaurant restaurant
    ) {
        return from(
                groupRestaurant,
                restaurant,
                null,
                0
        );
    }

    public static GroupRestaurantResponse from(
            GroupRestaurant groupRestaurant,
            Restaurant restaurant,
            BigDecimal averageScore,
            long ratingsCount
    ) {
        return new GroupRestaurantResponse(
                groupRestaurant.getId(),
                groupRestaurant.getGroupId(),
                groupRestaurant.getStatus(),
                groupRestaurant.isFavorite(),
                groupRestaurant.getProposedByUserId(),
                groupRestaurant.getGroupNotes(),
                groupRestaurant.getCreatedAt(),
                groupRestaurant.getUpdatedAt(),
                averageScore,
                ratingsCount,
                RestaurantResponse.from(restaurant)
        );
    }
}
