package com.pauluna.mesa.restaurant.application;

import java.util.UUID;

public class RestaurantAlreadyInGroupException
        extends RuntimeException {

    public RestaurantAlreadyInGroupException(UUID groupId) {
        super(
                "El restaurante ya está guardado en el grupo "
                        + groupId
                        + "."
        );
    }
}