package com.pauluna.mesa.restaurant.application;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class RestaurantSearchUnavailableException
        extends RuntimeException {

    public RestaurantSearchUnavailableException(
            Throwable cause
    ) {
        super(
                "El servicio de búsqueda de restaurantes "
                        + "no está disponible temporalmente.",
                cause
        );
    }
}