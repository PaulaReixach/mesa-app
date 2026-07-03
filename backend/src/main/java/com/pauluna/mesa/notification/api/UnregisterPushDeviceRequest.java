package com.pauluna.mesa.notification.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UnregisterPushDeviceRequest(

        @NotBlank(
                message = "El token push es obligatorio."
        )
        @Size(
                max = 255,
                message = "El token push no es válido."
        )
        String expoPushToken

) {
}