package com.pauluna.mesa.user.api;

import java.time.Instant;

import com.pauluna.mesa.user.domain.UserNotificationPreferences;

public record NotificationPreferencesResponse(

        boolean notificationsEnabled,
        boolean newRestaurantsEnabled,
        boolean restaurantStatusEnabled,
        boolean ratingsEnabled,
        boolean groupActivityEnabled,
        Instant updatedAt

) {

    public static NotificationPreferencesResponse from(
            UserNotificationPreferences preferences
    ) {
        return new NotificationPreferencesResponse(
                preferences.isNotificationsEnabled(),
                preferences.isNewRestaurantsEnabled(),
                preferences.isRestaurantStatusEnabled(),
                preferences.isRatingsEnabled(),
                preferences.isGroupActivityEnabled(),
                preferences.getUpdatedAt()
        );
    }
}