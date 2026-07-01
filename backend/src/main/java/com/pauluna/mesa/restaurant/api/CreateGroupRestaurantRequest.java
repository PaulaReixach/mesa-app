package com.pauluna.mesa.restaurant.api;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateGroupRestaurantRequest(

        @Size(
                max = 50,
                message = "El proveedor no puede superar los 50 caracteres."
        )
        String provider,

        @Size(
                max = 255,
                message = "El identificador externo no puede superar los 255 caracteres."
        )
        String externalPlaceId,

        @NotBlank(message = "El nombre del restaurante es obligatorio.")
        @Size(
                max = 150,
                message = "El nombre no puede superar los 150 caracteres."
        )
        String name,

        @Size(
                max = 300,
                message = "La dirección no puede superar los 300 caracteres."
        )
        String address,

        @Size(
                max = 100,
                message = "La ciudad no puede superar los 100 caracteres."
        )
        String city,

        @Size(
                max = 100,
                message = "El país no puede superar los 100 caracteres."
        )
        String country,

        @DecimalMin(
                value = "-90",
                message = "La latitud debe ser igual o superior a -90."
        )
        @DecimalMax(
                value = "90",
                message = "La latitud debe ser igual o inferior a 90."
        )
        BigDecimal latitude,

        @DecimalMin(
                value = "-180",
                message = "La longitud debe ser igual o superior a -180."
        )
        @DecimalMax(
                value = "180",
                message = "La longitud debe ser igual o inferior a 180."
        )
        BigDecimal longitude,

        @Size(
                max = 100,
                message = "La categoría no puede superar los 100 caracteres."
        )
        String category,

        @Size(
                max = 1000,
                message = "Las notas no pueden superar los 1000 caracteres."
        )
        String groupNotes
) {
}