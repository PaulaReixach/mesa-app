package com.pauluna.mesa.user.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(

        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres.")
        String name,

        @NotBlank(message = "El nombre de usuario es obligatorio.")
        @Size(
                min = 3,
                max = 50,
                message = "El nombre de usuario debe tener entre 3 y 50 caracteres."
        )
        String username,

        @NotBlank(message = "El email es obligatorio.")
        @Email(message = "El email no tiene un formato válido.")
        @Size(max = 255, message = "El email no puede superar los 255 caracteres.")
        String email,

        @NotBlank(message = "La contraseña es obligatoria.")
        @Size(
                min = 8,
                max = 72,
                message = "La contraseña debe tener entre 8 y 72 caracteres."
        )
        String password,

        @Size(max = 500, message = "La URL del avatar no puede superar los 500 caracteres.")
        String avatarUrl
) {
}