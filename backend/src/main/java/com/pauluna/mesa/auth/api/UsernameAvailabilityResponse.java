package com.pauluna.mesa.auth.api;

import java.util.List;

/** Whether a username is free and, when it is taken, up to three free alternatives. */
public record UsernameAvailabilityResponse(
        boolean available,
        List<String> suggestions
) {
}
