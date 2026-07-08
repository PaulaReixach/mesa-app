package com.pauluna.mesa.restaurant.application;

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
import com.pauluna.mesa.restaurant.domain.RestaurantProposal;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.domain.UserNotificationPreferences;
import com.pauluna.mesa.user.infrastructure.UserNotificationPreferencesRepository;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class RestaurantProposalNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationPreferencesRepository preferencesRepository;
    private final UserRepository userRepository;
    private final RestaurantGroupRepository groupRepository;
    private final ApplicationEventPublisher eventPublisher;

    public RestaurantProposalNotificationService(
            NotificationRepository notificationRepository,
            UserNotificationPreferencesRepository preferencesRepository,
            UserRepository userRepository,
            RestaurantGroupRepository groupRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.notificationRepository = notificationRepository;
        this.preferencesRepository = preferencesRepository;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.eventPublisher = eventPublisher;
    }

    public void notifyProposalCreated(RestaurantProposal proposal) {
        RestaurantGroup group = groupRepository
                .findById(proposal.getGroupId())
                .orElse(null);

        User proposer = userRepository
                .findById(proposal.getProposedByUserId())
                .orElse(null);

        if (group == null || proposer == null) {
            return;
        }

        UUID recipientUserId = group.getOwnerUserId();

        if (!shouldReceive(recipientUserId)) {
            return;
        }

        saveAndPublish(new AppNotification(
                recipientUserId,
                proposer.getId(),
                proposer.getName(),
                proposer.getAvatarUrl(),
                NotificationType.GROUP_ACTIVITY,
                "Nueva propuesta de restaurante",
                proposer.getName()
                        + " ha propuesto "
                        + proposal.getName()
                        + " para “"
                        + group.getName()
                        + "”.",
                "/groups/"
                        + group.getId()
                        + "/restaurant-proposals"
        ));
    }

    public void notifyProposalAccepted(
            RestaurantProposal proposal,
            UUID ownerUserId
    ) {
        notifyProposalResolved(
                proposal,
                ownerUserId,
                "Propuesta aceptada",
                proposal.getName()
                        + " ya forma parte del grupo."
        );
    }

    public void notifyProposalRejected(
            RestaurantProposal proposal,
            UUID ownerUserId
    ) {
        notifyProposalResolved(
                proposal,
                ownerUserId,
                "Propuesta rechazada",
                "La propuesta de "
                        + proposal.getName()
                        + " no se ha añadido al grupo."
        );
    }

    private void notifyProposalResolved(
            RestaurantProposal proposal,
            UUID ownerUserId,
            String title,
            String message
    ) {
        UUID recipientUserId = proposal.getProposedByUserId();

        if (recipientUserId.equals(ownerUserId)
                || !shouldReceive(recipientUserId)) {
            return;
        }

        User owner = userRepository
                .findById(ownerUserId)
                .orElse(null);

        if (owner == null) {
            return;
        }

        saveAndPublish(new AppNotification(
                recipientUserId,
                owner.getId(),
                owner.getName(),
                owner.getAvatarUrl(),
                NotificationType.GROUP_ACTIVITY,
                title,
                message,
                "/groups/"
                        + proposal.getGroupId()
                        + "/collaboration"
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
