package com.pauluna.mesa.restaurant.application;

import java.util.UUID;

public class GroupRestaurantNotFoundException
        extends RuntimeException {

    public GroupRestaurantNotFoundException(
            UUID groupRestaurantId
    ) {
        super(
                "No se ha encontrado el restaurante del grupo con id "
                        + groupRestaurantId
                        + "."
        );
    }
}