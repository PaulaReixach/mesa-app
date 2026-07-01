package com.pauluna.mesa.restaurant.application;

import java.util.UUID;

public class RestaurantNotFoundException extends RuntimeException {

    public RestaurantNotFoundException(UUID restaurantId) {
        super(
                "No se ha encontrado el restaurante con id "
                        + restaurantId
                        + "."
        );
    }
}