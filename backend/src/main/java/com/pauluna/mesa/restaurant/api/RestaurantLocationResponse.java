package com.pauluna.mesa.restaurant.api;

import java.math.BigDecimal;

public record RestaurantLocationResponse(
        String label,
        String address,
        String city,
        String country,
        BigDecimal latitude,
        BigDecimal longitude
) {
}
