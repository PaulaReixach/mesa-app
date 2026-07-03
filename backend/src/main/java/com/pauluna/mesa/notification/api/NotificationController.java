package com.pauluna.mesa.notification.api;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.notification.application.NotificationService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService
            notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {
        this.notificationService =
                notificationService;
    }

    @GetMapping
    public ResponseEntity<NotificationPageResponse>
    getNotifications(
            @RequestParam(
                    defaultValue = "ALL"
            )
            NotificationFilter filter,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "10"
            )
            int size,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                notificationService
                        .getNotifications(
                                userId,
                                filter,
                                page,
                                size
                        )
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadNotificationCountResponse>
    getUnreadCount(
            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                new UnreadNotificationCountResponse(
                        notificationService
                                .getUnreadCount(
                                        userId
                                )
                )
        );
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse>
    markAsRead(
            @PathVariable
            UUID notificationId,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                notificationService
                        .markAsRead(
                                notificationId,
                                userId
                        )
        );
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void>
    markAllAsRead(
            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        notificationService
                .markAllAsRead(userId);

        return ResponseEntity
                .noContent()
                .build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void>
    deleteNotification(
            @PathVariable
            UUID notificationId,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        notificationService
                .deleteNotification(
                        notificationId,
                        userId
                );

        return ResponseEntity
                .noContent()
                .build();
    }

    @DeleteMapping
    public ResponseEntity<Void>
    deleteAllNotifications(
            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        notificationService
                .deleteAllNotifications(
                        userId
                );

        return ResponseEntity
                .noContent()
                .build();
    }
}