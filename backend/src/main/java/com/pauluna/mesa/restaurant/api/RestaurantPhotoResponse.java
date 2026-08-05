package com.pauluna.mesa.restaurant.api;

import java.time.Instant;
import java.util.UUID;

public record RestaurantPhotoResponse(
        UUID id,
        String imageUrl,
        UUID uploadedByUserId,
        String uploadedByName,
        String uploadedByUsername,
        String uploadedByAvatarUrl,
        boolean uploadedByCurrentUser,
        boolean canDelete,
        Instant createdAt
) {
}
