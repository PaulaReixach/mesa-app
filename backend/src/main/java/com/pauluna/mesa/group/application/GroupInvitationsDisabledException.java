package com.pauluna.mesa.group.application;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class GroupInvitationsDisabledException
        extends ResponseStatusException {

    public GroupInvitationsDisabledException(
            String username
    ) {
        super(
                HttpStatus.FORBIDDEN,
                "@"
                        + username
                        + " no permite que le añadan a grupos."
        );
    }
}