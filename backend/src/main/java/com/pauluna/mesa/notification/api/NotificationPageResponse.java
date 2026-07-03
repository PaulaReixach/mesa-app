package com.pauluna.mesa.notification.api;

import java.util.List;

public record NotificationPageResponse(

        List<NotificationResponse> items,
        int page,
        int size,
        boolean hasMore,
        long unreadCount

) {
}