package com.pauluna.mesa.group.application;

import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.notification.application.NotificationCreatedEvent;
import com.pauluna.mesa.notification.domain.AppNotification;
import com.pauluna.mesa.notification.domain.NotificationType;
import com.pauluna.mesa.notification.infrastructure.NotificationRepository;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.domain.UserNotificationPreferences;
import com.pauluna.mesa.user.infrastructure.UserNotificationPreferencesRepository;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class GroupCollaborationNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationPreferencesRepository preferencesRepository;
    private final RestaurantGroupRepository groupRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public GroupCollaborationNotificationService(
            NotificationRepository notificationRepository,
            UserNotificationPreferencesRepository preferencesRepository,
            RestaurantGroupRepository groupRepository,
            UserRepository userRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.notificationRepository = notificationRepository;
        this.preferencesRepository = preferencesRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    public void notifyRequestCreated(
            UUID groupId,
            UUID requesterUserId
    ) {
        RestaurantGroup group = groupRepository
                .findById(groupId)
                .orElse(null);
        User requester = userRepository
                .findById(requesterUserId)
                .orElse(null);

        if (group == null || requester == null) {
            return;
        }

        UUID ownerUserId = group.getOwnerUserId();

        if (ownerUserId.equals(requesterUserId)
                || !shouldReceive(ownerUserId)) {
            return;
        }

        saveAndPublish(new AppNotification(
                ownerUserId,
                requester.getId(),
                requester.getName(),
                requester.getAvatarUrl(),
                NotificationType.GROUP_ACTIVITY,
                "Nueva solicitud de colaboración",
                requester.getName()
                        + " quiere colaborar en “"
                        + group.getName()
                        + "”.",
                "/groups/"
                        + groupId
                        + "/collaboration-requests"
        ));
    }

    public void notifyRequestAccepted(
            UUID groupId,
            UUID requesterUserId,
            UUID ownerUserId
    ) {
        notifyDecision(
                groupId,
                requesterUserId,
                ownerUserId,
                "Solicitud de colaboración aceptada",
                "Ya puedes colaborar en “%s”."
        );
    }

    public void notifyRequestRejected(
            UUID groupId,
            UUID requesterUserId,
            UUID ownerUserId
    ) {
        notifyDecision(
                groupId,
                requesterUserId,
                ownerUserId,
                "Solicitud de colaboración rechazada",
                "Tu solicitud para colaborar en “%s” ha sido rechazada."
        );
    }

    private void notifyDecision(
            UUID groupId,
            UUID requesterUserId,
            UUID ownerUserId,
            String title,
            String messageTemplate
    ) {
        if (requesterUserId.equals(ownerUserId)
                || !shouldReceive(requesterUserId)) {
            return;
        }

        RestaurantGroup group = groupRepository
                .findById(groupId)
                .orElse(null);
        User owner = userRepository
                .findById(ownerUserId)
                .orElse(null);

        if (group == null || owner == null) {
            return;
        }

        saveAndPublish(new AppNotification(
                requesterUserId,
                owner.getId(),
                owner.getName(),
                owner.getAvatarUrl(),
                NotificationType.GROUP_ACTIVITY,
                title,
                messageTemplate.formatted(group.getName()),
                "/groups/public/" + groupId
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
