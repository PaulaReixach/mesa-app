package com.pauluna.mesa.group.application;

import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.notification.application.NotificationCreatedEvent;
import com.pauluna.mesa.notification.domain.AppNotification;
import com.pauluna.mesa.notification.domain.NotificationType;
import com.pauluna.mesa.notification.infrastructure.NotificationRepository;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.domain.UserNotificationPreferences;
import com.pauluna.mesa.user.infrastructure.UserNotificationPreferencesRepository;

@Service
@Transactional
public class GroupInvitationNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationPreferencesRepository preferencesRepository;
    private final ApplicationEventPublisher eventPublisher;

    public GroupInvitationNotificationService(
            NotificationRepository notificationRepository,
            UserNotificationPreferencesRepository preferencesRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.notificationRepository = notificationRepository;
        this.preferencesRepository = preferencesRepository;
        this.eventPublisher = eventPublisher;
    }

    public void notifyInvitationCreated(
            RestaurantGroup group,
            User invitedUser,
            User invitedBy
    ) {
        if (invitedUser.getId().equals(invitedBy.getId())
                || !shouldReceive(invitedUser.getId())) {
            return;
        }

        saveAndPublish(new AppNotification(
                invitedUser.getId(),
                invitedBy.getId(),
                invitedBy.getName(),
                invitedBy.getAvatarUrl(),
                NotificationType.GROUP_INVITATION,
                "Nueva invitación a grupo",
                invitedBy.getName()
                        + " te ha invitado a “"
                        + group.getName()
                        + "”.",
                "/group-invitations"
        ));
    }

    public void notifyInvitationAccepted(
            RestaurantGroup group,
            User invitedUser,
            User invitedBy
    ) {
        notifyDecision(
                group,
                invitedUser,
                invitedBy,
                invitedUser.getName() + " ha aceptado tu invitación",
                "Ya forma parte de “" + group.getName() + "”."
        );
    }

    public void notifyInvitationRejected(
            RestaurantGroup group,
            User invitedUser,
            User invitedBy
    ) {
        notifyDecision(
                group,
                invitedUser,
                invitedBy,
                invitedUser.getName() + " ha rechazado tu invitación",
                "No se unirá a “" + group.getName() + "”."
        );
    }

    private void notifyDecision(
            RestaurantGroup group,
            User invitedUser,
            User invitedBy,
            String title,
            String message
    ) {
        if (invitedUser.getId().equals(invitedBy.getId())
                || !shouldReceive(invitedBy.getId())) {
            return;
        }

        saveAndPublish(new AppNotification(
                invitedBy.getId(),
                invitedUser.getId(),
                invitedUser.getName(),
                invitedUser.getAvatarUrl(),
                NotificationType.GROUP_ACTIVITY,
                title,
                message,
                "/groups/" + group.getId()
        ));
    }

    private boolean shouldReceive(UUID userId) {
        UserNotificationPreferences preferences =
                preferencesRepository.findById(userId).orElse(null);

        return preferences == null
                || (preferences.isNotificationsEnabled()
                && preferences.isGroupActivityEnabled());
    }

    private void saveAndPublish(AppNotification notification) {
        AppNotification saved = notificationRepository.saveAndFlush(notification);

        eventPublisher.publishEvent(
                new NotificationCreatedEvent(saved.getId())
        );
    }
}
