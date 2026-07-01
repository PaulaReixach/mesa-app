package com.pauluna.mesa.restaurant.api;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.restaurant.domain.Restaurant;

public record RestaurantResponse(
        UUID id,
        String provider,
        String externalPlaceId,
        String name,
        String address,
        String city,
        String country,
        BigDecimal latitude,
        BigDecimal longitude,
        String category,
        Instant createdAt,
        Instant updatedAt
) {

    public static RestaurantResponse from(Restaurant restaurant) {
        return new RestaurantResponse(
                restaurant.getId(),
                restaurant.getProvider(),
                restaurant.getExternalPlaceId(),
                restaurant.getName(),
                restaurant.getAddress(),
                restaurant.getCity(),
                restaurant.getCountry(),
                restaurant.getLatitude(),
                restaurant.getLongitude(),
                restaurant.getCategory(),
                restaurant.getCreatedAt(),
                restaurant.getUpdatedAt()
        );
    }
}