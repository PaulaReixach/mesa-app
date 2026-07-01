package com.pauluna.mesa.group.application;

import java.util.UUID;

public class GroupAccessDeniedException extends RuntimeException {

    public GroupAccessDeniedException(UUID groupId) {
        super("El usuario no pertenece al grupo " + groupId + ".");
    }
}