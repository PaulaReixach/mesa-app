package com.pauluna.mesa.restaurant.api;

import java.math.BigDecimal;
import java.util.List;

public record RestaurantRatingsResponse(
        BigDecimal averageScore,
        long ratingsCount,
        Integer currentUserScore,
        List<RestaurantRatingResponse> ratings
) {
}