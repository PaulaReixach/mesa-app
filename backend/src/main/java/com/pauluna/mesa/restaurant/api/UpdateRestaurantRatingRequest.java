package com.pauluna.mesa.restaurant.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateRestaurantRatingRequest(

        @NotNull(message = "La puntuación es obligatoria.")
        @Min(
                value = 1,
                message = "La puntuación mínima es 1."
        )
        @Max(
                value = 5,
                message = "La puntuación máxima es 5."
        )
        Integer score

) {
}