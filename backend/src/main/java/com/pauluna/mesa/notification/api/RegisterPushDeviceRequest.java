package com.pauluna.mesa.notification.api;

import com.pauluna.mesa.notification.domain.PushPlatform;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterPushDeviceRequest(

        @NotBlank(
                message = "El token push es obligatorio."
        )
        @Size(
                max = 255,
                message = "El token push no es válido."
        )
        String expoPushToken,

        @NotNull(
                message = "La plataforma es obligatoria."
        )
        PushPlatform platform,

        @Size(
                max = 150,
                message = "El nombre del dispositivo es demasiado largo."
        )
        String deviceName

) {
}