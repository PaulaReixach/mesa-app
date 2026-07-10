package com.pauluna.mesa.restaurant.application;

public record RestaurantImageContent(
        String contentType,
        byte[] imageData
) {
}
