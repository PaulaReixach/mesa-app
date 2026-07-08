package com.pauluna.mesa.group.api;

import com.pauluna.mesa.group.domain.GroupPrivacy;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateGroupRequest(
        @NotBlank(message = "El nombre del grupo es obligatorio.")
        @Size(
                max = 100,
                message = "El nombre del grupo no puede superar los 100 caracteres."
        )
        String name,

        @Size(
                max = 500,
                message = "La descripción no puede superar los 500 caracteres."
        )
        String description,

        @Size(
                max = 500,
                message = "La URL de la imagen no puede superar los 500 caracteres."
        )
        String imageUrl,

        @Size(
                max = 100,
                message = "La ciudad no puede superar los 100 caracteres."
        )
        String city,

        @NotNull(message = "La privacidad del grupo es obligatoria.")
        GroupPrivacy privacy,

        Boolean acceptingCollaborators
) {

    public CreateGroupRequest(
            String name,
            String description,
            String imageUrl,
            String city,
            GroupPrivacy privacy
    ) {
        this(
                name,
                description,
                imageUrl,
                city,
                privacy,
                null
        );
    }
}
