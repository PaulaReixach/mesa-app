package com.pauluna.mesa.group.api;

import jakarta.validation.constraints.Size;

public record CreateCollaborationRequest(
        @Size(
                max = 300,
                message = "El mensaje no puede superar los 300 caracteres."
        )
        String message
) {
}
