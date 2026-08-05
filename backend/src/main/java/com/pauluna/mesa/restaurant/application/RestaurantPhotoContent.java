package com.pauluna.mesa.restaurant.application;

public record RestaurantPhotoContent(
        String contentType,
        byte[] imageData
) {
}
