package com.pauluna.mesa.notification.application;

import java.util.UUID;

public record NotificationCreatedEvent(

        UUID notificationId

) {
}