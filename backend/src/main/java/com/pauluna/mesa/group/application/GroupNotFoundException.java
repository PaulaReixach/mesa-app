package com.pauluna.mesa.group.application;

import java.util.UUID;

public class GroupNotFoundException extends RuntimeException {

    public GroupNotFoundException(UUID groupId) {
        super("No se ha encontrado el grupo con id " + groupId + ".");
    }
}