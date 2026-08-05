package com.pauluna.mesa.restaurant.domain;

import java.time.Instant;
import java.util.UUID;

public record RestaurantPhotoMetadata(
        UUID id,
        UUID uploadedByUserId,
        Instant createdAt
) {
}
