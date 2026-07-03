package com.pauluna.mesa.notification.push;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.pauluna.mesa.notification.application.NotificationCreatedEvent;
import com.pauluna.mesa.notification.infrastructure.NotificationRepository;

@Component
public class NotificationPushListener {

    private final NotificationRepository
            notificationRepository;

    private final ExpoPushService
            expoPushService;

    public NotificationPushListener(
            NotificationRepository notificationRepository,
            ExpoPushService expoPushService
    ) {
        this.notificationRepository =
                notificationRepository;

        this.expoPushService =
                expoPushService;
    }

    @Async
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleNotificationCreated(
            NotificationCreatedEvent event
    ) {
        notificationRepository
                .findById(
                        event.notificationId()
                )
                .ifPresent(
                        expoPushService
                                ::sendNotification
                );
    }
}