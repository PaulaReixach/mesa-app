package com.pauluna.mesa.auth.application;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("El email, nombre de usuario o contraseña no son correctos.");
    }
}