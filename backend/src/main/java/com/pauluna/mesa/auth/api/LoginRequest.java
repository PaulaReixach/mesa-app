package com.pauluna.mesa.auth.api;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @NotBlank(message = "El email o nombre de usuario es obligatorio.")
        String identifier,

        @NotBlank(message = "La contraseña es obligatoria.")
        String password
) {
}