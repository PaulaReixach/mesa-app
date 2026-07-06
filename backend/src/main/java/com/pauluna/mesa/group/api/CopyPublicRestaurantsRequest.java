package com.pauluna.mesa.group.api;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CopyPublicRestaurantsRequest(
        @NotNull(
                message = "El grupo de destino es obligatorio."
        )
        UUID destinationGroupId,

        @NotEmpty(
                message = "Selecciona al menos un restaurante."
        )
        @Size(
                max = 100,
                message = "No puedes copiar más de 100 restaurantes a la vez."
        )
        List<@NotNull UUID> groupRestaurantIds
) {
}
