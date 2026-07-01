package com.pauluna.mesa.restaurant.api;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.restaurant.domain.RestaurantRating;
import com.pauluna.mesa.user.domain.User;

public record RestaurantRatingResponse(
        UUID id,
        UUID userId,
        String name,
        String username,
        String avatarUrl,
        int score,
        boolean currentUser,
        Instant createdAt,
        Instant updatedAt
) {

    public static RestaurantRatingResponse from(
            RestaurantRating rating,
            User user,
            boolean currentUser
    ) {
        return new RestaurantRatingResponse(
                rating.getId(),
                rating.getUserId(),
                user.getName(),
                user.getUsername(),
                user.getAvatarUrl(),
                rating.getScore(),
                currentUser,
                rating.getCreatedAt(),
                rating.getUpdatedAt()
        );
    }
}