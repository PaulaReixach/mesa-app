package com.pauluna.mesa.restaurant.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateGroupRestaurantRequest(

        @NotBlank(message = "El nombre del restaurante es obligatorio.")
        @Size(
                max = 150,
                message = "El nombre del restaurante no puede superar los 150 caracteres."
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
