package com.pauluna.mesa.restaurant.application;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidRestaurantSearchException
        extends RuntimeException {

    public InvalidRestaurantSearchException(String message) {
        super(message);
    }
}