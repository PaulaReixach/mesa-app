package com.pauluna.mesa.restaurant.application;

public class InvalidRestaurantDataException
        extends RuntimeException {

    public InvalidRestaurantDataException(String message) {
        super(message);
    }
}