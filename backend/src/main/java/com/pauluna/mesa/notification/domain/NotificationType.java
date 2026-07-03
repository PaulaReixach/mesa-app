package com.pauluna.mesa.notification.domain;

public enum NotificationType {

    GROUP_INVITATION(
            NotificationCategory.INVITATIONS
    ),

    NEW_RESTAURANT(
            NotificationCategory.ACTIVITY
    ),

    RESTAURANT_STATUS_CHANGED(
            NotificationCategory.ACTIVITY
    ),

    RESTAURANT_RATED(
            NotificationCategory.ACTIVITY
    ),

    GROUP_ACTIVITY(
            NotificationCategory.ACTIVITY
    );

    private final NotificationCategory category;

    NotificationType(
            NotificationCategory category
    ) {
        this.category = category;
    }

    public NotificationCategory getCategory() {
        return category;
    }
}