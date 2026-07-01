package com.pauluna.mesa.restaurant.api;

import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateGroupRestaurantStatusRequest(

        @NotNull(message = "El estado del restaurante es obligatorio.")
        GroupRestaurantStatus status

) {
}