package com.pauluna.mesa.user.api;

import java.time.Instant;

import com.pauluna.mesa.user.domain.UserPrivacyPreferences;

public record PrivacyPreferencesResponse(

        boolean groupInvitationsEnabled,
        Instant updatedAt

) {

    public static PrivacyPreferencesResponse from(
            UserPrivacyPreferences preferences
    ) {
        return new PrivacyPreferencesResponse(
                preferences
                        .isGroupInvitationsEnabled(),
                preferences.getUpdatedAt()
        );
    }
}