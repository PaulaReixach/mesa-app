package com.pauluna.mesa.group.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateGroupInvitationRequest(

        @NotBlank(
                message = "El nombre de usuario es obligatorio."
        )
        @Size(
                max = 50,
                message = "El nombre de usuario no puede superar "
                        + "los 50 caracteres."
        )
        String username
) {
}
