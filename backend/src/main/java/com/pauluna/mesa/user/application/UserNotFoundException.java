package com.pauluna.mesa.user.application;

import java.util.UUID;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(UUID userId) {
        super("No se ha encontrado el usuario con id " + userId + ".");
    }
}