package com.pauluna.mesa.group.application;

import java.util.UUID;

public class GroupOwnerAccessRequiredException
        extends RuntimeException {

    public GroupOwnerAccessRequiredException(UUID groupId) {
        super(
                "Solo la persona propietaria puede gestionar "
                        + "los miembros del grupo "
                        + groupId
                        + "."
        );
    }
}