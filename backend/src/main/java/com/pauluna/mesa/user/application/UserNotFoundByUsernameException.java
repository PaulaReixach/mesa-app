package com.pauluna.mesa.user.application;

public class UserNotFoundByUsernameException
        extends RuntimeException {

    public UserNotFoundByUsernameException(String username) {
        super(
                "No se ha encontrado ningún usuario con el nombre @"
                        + username
                        + "."
        );
    }
}