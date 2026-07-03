package com.pauluna.mesa.user.api;

import jakarta.validation.constraints.NotNull;

public record UpdateNotificationPreferencesRequest(

        @NotNull(
                message = "El estado general de las notificaciones es obligatorio."
        )
        Boolean notificationsEnabled,

        @NotNull(
                message = "La preferencia de nuevos restaurantes es obligatoria."
        )
        Boolean newRestaurantsEnabled,

        @NotNull(
                message = "La preferencia de cambios de estado es obligatoria."
        )
        Boolean restaurantStatusEnabled,

        @NotNull(
                message = "La preferencia de valoraciones es obligatoria."
        )
        Boolean ratingsEnabled,

        @NotNull(
                message = "La preferencia de actividad de grupos es obligatoria."
        )
        Boolean groupActivityEnabled

) {
}