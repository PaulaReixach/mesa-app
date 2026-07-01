package com.pauluna.mesa.group.application;

import java.util.UUID;

public class GroupMemberNotFoundException
        extends RuntimeException {

    public GroupMemberNotFoundException(
            UUID groupId,
            UUID userId
    ) {
        super(
                "El usuario "
                        + userId
                        + " no pertenece al grupo "
                        + groupId
                        + "."
        );
    }
}