package com.pauluna.mesa.restaurant.api;

import java.math.BigDecimal;

public record RestaurantSearchResponse(
        String provider,
        String externalPlaceId,
        String name,
        String address,
        String city,
        String country,
        BigDecimal latitude,
        BigDecimal longitude,
        String category
) {
}