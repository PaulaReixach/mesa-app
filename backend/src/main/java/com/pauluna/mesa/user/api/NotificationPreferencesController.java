package com.pauluna.mesa.user.api;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.user.application.NotificationPreferencesService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(
        "/users/me/notification-preferences"
)
public class NotificationPreferencesController {

    private final NotificationPreferencesService
            notificationPreferencesService;

    public NotificationPreferencesController(
            NotificationPreferencesService
                    notificationPreferencesService
    ) {
        this.notificationPreferencesService =
                notificationPreferencesService;
    }

    @GetMapping
    public ResponseEntity<NotificationPreferencesResponse>
    getCurrentUserNotificationPreferences(
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                notificationPreferencesService
                        .getPreferences(userId)
        );
    }

    @PutMapping
    public ResponseEntity<NotificationPreferencesResponse>
    updateCurrentUserNotificationPreferences(
            @Valid
            @RequestBody
            UpdateNotificationPreferencesRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                notificationPreferencesService
                        .updatePreferences(
                                userId,
                                request
                        )
        );
    }
}