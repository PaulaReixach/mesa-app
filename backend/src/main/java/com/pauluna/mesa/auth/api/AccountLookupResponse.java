package com.pauluna.mesa.auth.api;

/**
 * Whether an email or username already has an account, so the sign-in flow can ask for the
 * password or offer to create the account. Only the display name is revealed.
 */
public record AccountLookupResponse(
        boolean exists,
        String name
) {

    public static AccountLookupResponse notFound() {
        return new AccountLookupResponse(false, null);
    }
}
