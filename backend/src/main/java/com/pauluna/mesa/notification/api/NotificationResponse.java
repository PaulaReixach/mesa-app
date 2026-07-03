package com.pauluna.mesa.notification.api;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.notification.domain.AppNotification;
import com.pauluna.mesa.notification.domain.NotificationCategory;
import com.pauluna.mesa.notification.domain.NotificationType;

public record NotificationResponse(

        UUID id,
        NotificationType type,
        NotificationCategory category,
        String title,
        String message,
        UUID actorUserId,
        String actorName,
        String actorAvatarUrl,
        String targetUrl,
        boolean read,
        Instant readAt,
        Instant createdAt

) {

    public static NotificationResponse from(
            AppNotification notification
    ) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getCategory(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getActorUserId(),
                notification.getActorName(),
                notification.getActorAvatarUrl(),
                notification.getTargetUrl(),
                notification.isRead(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}