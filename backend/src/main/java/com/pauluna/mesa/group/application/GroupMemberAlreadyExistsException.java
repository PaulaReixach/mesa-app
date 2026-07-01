package com.pauluna.mesa.group.application;

import java.util.UUID;

public class GroupMemberAlreadyExistsException
        extends RuntimeException {

    public GroupMemberAlreadyExistsException(
            UUID groupId,
            String username
    ) {
        super(
                "El usuario @"
                        + username
                        + " ya pertenece al grupo "
                        + groupId
                        + "."
        );
    }
}