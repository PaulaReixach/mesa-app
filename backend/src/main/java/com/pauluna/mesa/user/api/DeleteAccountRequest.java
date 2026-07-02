package com.pauluna.mesa.user.api;

import jakarta.validation.constraints.NotBlank;

public record DeleteAccountRequest(

        @NotBlank(
                message = "La contraseña es obligatoria."
        )
        String password

) {
}