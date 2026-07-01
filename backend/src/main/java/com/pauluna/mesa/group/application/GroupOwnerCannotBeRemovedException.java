package com.pauluna.mesa.group.application;

import java.util.UUID;

public class GroupOwnerCannotBeRemovedException
        extends RuntimeException {

    public GroupOwnerCannotBeRemovedException(UUID groupId) {
        super(
                "No se puede eliminar a la persona propietaria "
                        + "del grupo "
                        + groupId
                        + "."
        );
    }
}