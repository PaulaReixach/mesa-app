package com.pauluna.mesa.notification.application;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.domain.GroupMember;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.notification.api.NotificationFilter;
import com.pauluna.mesa.notification.api.NotificationPageResponse;
import com.pauluna.mesa.notification.api.NotificationResponse;
import com.pauluna.mesa.notification.domain.AppNotification;
import com.pauluna.mesa.notification.domain.NotificationCategory;
import com.pauluna.mesa.notification.domain.NotificationType;
import com.pauluna.mesa.notification.infrastructure.NotificationRepository;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;
import com.pauluna.mesa.restaurant.domain.Restaurant;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRepository;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.domain.UserNotificationPreferences;
import com.pauluna.mesa.user.infrastructure.UserNotificationPreferencesRepository;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class NotificationService {

    private static final int MAXIMUM_PAGE_SIZE = 50;

    private final NotificationRepository notificationRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final RestaurantGroupRepository restaurantGroupRepository;
    private final GroupRestaurantRepository groupRestaurantRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    private final UserNotificationPreferencesRepository
            notificationPreferencesRepository;

    private final ApplicationEventPublisher eventPublisher;

    public NotificationService(
            NotificationRepository notificationRepository,
            GroupMemberRepository groupMemberRepository,
            RestaurantGroupRepository restaurantGroupRepository,
            GroupRestaurantRepository groupRestaurantRepository,
            RestaurantRepository restaurantRepository,
            UserRepository userRepository,
            UserNotificationPreferencesRepository
                    notificationPreferencesRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.notificationRepository = notificationRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.restaurantGroupRepository = restaurantGroupRepository;
        this.groupRestaurantRepository = groupRestaurantRepository;
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
        this.notificationPreferencesRepository =
                notificationPreferencesRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public NotificationPageResponse getNotifications(
            UUID userId,
            NotificationFilter filter,
            int requestedPage,
            int requestedSize
    ) {
        validateUserExists(userId);

        int page = Math.max(requestedPage, 0);

        int size = Math.min(
                Math.max(requestedSize, 1),
                MAXIMUM_PAGE_SIZE
        );

        PageRequest pageable =
                PageRequest.of(page, size);

        Page<AppNotification> result =
                switch (filter) {
                    case ALL ->
                            notificationRepository
                                    .findAllByUserIdOrderByCreatedAtDesc(
                                            userId,
                                            pageable
                                    );

                    case INVITATIONS ->
                            notificationRepository
                                    .findAllByUserIdAndCategoryOrderByCreatedAtDesc(
                                            userId,
                                            NotificationCategory.INVITATIONS,
                                            pageable
                                    );

                    case ACTIVITY ->
                            notificationRepository
                                    .findAllByUserIdAndCategoryOrderByCreatedAtDesc(
                                            userId,
                                            NotificationCategory.ACTIVITY,
                                            pageable
                                    );
                };

        List<NotificationResponse> items =
                result.getContent()
                        .stream()
                        .map(NotificationResponse::from)
                        .toList();

        return new NotificationPageResponse(
                items,
                page,
                size,
                result.hasNext(),
                notificationRepository
                        .countByUserIdAndReadFalse(userId)
        );
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(
            UUID userId
    ) {
        validateUserExists(userId);

        return notificationRepository
                .countByUserIdAndReadFalse(userId);
    }

    public NotificationResponse markAsRead(
            UUID notificationId,
            UUID userId
    ) {
        AppNotification notification =
                notificationRepository
                        .findByIdAndUserId(
                                notificationId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "La notificación no existe."
                                )
                        );

        notification.markAsRead();

        return NotificationResponse.from(
                notificationRepository
                        .saveAndFlush(notification)
        );
    }

    public void markAllAsRead(
            UUID userId
    ) {
        validateUserExists(userId);

        notificationRepository.markAllAsRead(
                userId,
                Instant.now()
        );
    }

    public void notifyGroupInvitation(
            UUID groupId,
            UUID invitedUserId,
            UUID actorUserId
    ) {
        if (invitedUserId.equals(actorUserId)) {
            return;
        }

        RestaurantGroup group =
                getGroup(groupId);

        User actor =
                getUser(actorUserId);

        if (
                !shouldReceive(
                        invitedUserId,
                        NotificationType.GROUP_INVITATION
                )
        ) {
            return;
        }

        AppNotification notification =
                createNotification(
                        invitedUserId,
                        actor,
                        NotificationType.GROUP_INVITATION,
                        "Nueva invitación a grupo",
                        actor.getName()
                                + " te ha añadido a “"
                                + group.getName()
                                + "”.",
                        "/groups/" + groupId
                );

        saveAndPublish(
                List.of(notification)
        );
    }

    public void notifyRestaurantAdded(
            UUID groupId,
            UUID groupRestaurantId,
            UUID actorUserId
    ) {
        RestaurantContext context =
                getRestaurantContext(
                        groupId,
                        groupRestaurantId
                );

        User actor =
                getUser(actorUserId);

        List<UUID> recipientIds =
                getGroupRecipientIds(
                        groupId,
                        actorUserId
                );

        List<AppNotification> notifications =
                recipientIds.stream()
                        .filter(recipientId ->
                                shouldReceive(
                                        recipientId,
                                        NotificationType.NEW_RESTAURANT
                                )
                        )
                        .map(recipientId ->
                                createNotification(
                                        recipientId,
                                        actor,
                                        NotificationType.NEW_RESTAURANT,
                                        actor.getName()
                                                + " ha añadido un restaurante",
                                        context.restaurant().getName()
                                                + " se ha añadido a "
                                                + context.group().getName()
                                                + ".",
                                        restaurantTargetUrl(
                                                groupId,
                                                groupRestaurantId
                                        )
                                )
                        )
                        .toList();

        saveAndPublish(notifications);
    }

    public void notifyRestaurantStatusChanged(
            UUID groupId,
            UUID groupRestaurantId,
            GroupRestaurantStatus status,
            UUID actorUserId
    ) {
        RestaurantContext context =
                getRestaurantContext(
                        groupId,
                        groupRestaurantId
                );

        User actor =
                getUser(actorUserId);

        String statusLabel =
                getStatusLabel(status);

        List<AppNotification> notifications =
                getGroupRecipientIds(
                        groupId,
                        actorUserId
                )
                        .stream()
                        .filter(recipientId ->
                                shouldReceive(
                                        recipientId,
                                        NotificationType
                                                .RESTAURANT_STATUS_CHANGED
                                )
                        )
                        .map(recipientId ->
                                createNotification(
                                        recipientId,
                                        actor,
                                        NotificationType
                                                .RESTAURANT_STATUS_CHANGED,
                                        actor.getName()
                                                + " ha actualizado "
                                                + context.restaurant()
                                                        .getName(),
                                        "Ahora está marcado como "
                                                + statusLabel
                                                + ".",
                                        restaurantTargetUrl(
                                                groupId,
                                                groupRestaurantId
                                        )
                                )
                        )
                        .toList();

        saveAndPublish(notifications);
    }

    public void notifyRestaurantRated(
            UUID groupId,
            UUID groupRestaurantId,
            int score,
            UUID actorUserId
    ) {
        RestaurantContext context =
                getRestaurantContext(
                        groupId,
                        groupRestaurantId
                );

        User actor =
                getUser(actorUserId);

        List<AppNotification> notifications =
                getGroupRecipientIds(
                        groupId,
                        actorUserId
                )
                        .stream()
                        .filter(recipientId ->
                                shouldReceive(
                                        recipientId,
                                        NotificationType.RESTAURANT_RATED
                                )
                        )
                        .map(recipientId ->
                                createNotification(
                                        recipientId,
                                        actor,
                                        NotificationType.RESTAURANT_RATED,
                                        actor.getName()
                                                + " ha valorado "
                                                + context.restaurant()
                                                        .getName(),
                                        context.group().getName()
                                                + " · "
                                                + score
                                                + " ★",
                                        restaurantTargetUrl(
                                                groupId,
                                                groupRestaurantId
                                        )
                                )
                        )
                        .toList();

        saveAndPublish(notifications);
    }

    private AppNotification createNotification(
            UUID recipientUserId,
            User actor,
            NotificationType type,
            String title,
            String message,
            String targetUrl
    ) {
        return new AppNotification(
                recipientUserId,
                actor.getId(),
                actor.getName(),
                actor.getAvatarUrl(),
                type,
                title,
                message,
                targetUrl
        );
    }

    private void saveAndPublish(
            List<AppNotification> notifications
    ) {
        if (notifications.isEmpty()) {
            return;
        }

        List<AppNotification> savedNotifications =
                notificationRepository
                        .saveAll(notifications);

        notificationRepository.flush();

        savedNotifications.forEach(notification ->
                eventPublisher.publishEvent(
                        new NotificationCreatedEvent(
                                notification.getId()
                        )
                )
        );
    }

    private List<UUID> getGroupRecipientIds(
            UUID groupId,
            UUID actorUserId
    ) {
        return groupMemberRepository
                .findAllByGroupIdOrderByJoinedAtAsc(
                        groupId
                )
                .stream()
                .map(GroupMember::getUserId)
                .filter(userId ->
                        !userId.equals(actorUserId)
                )
                .distinct()
                .toList();
    }

    private boolean shouldReceive(
            UUID userId,
            NotificationType type
    ) {
        UserNotificationPreferences preferences =
                notificationPreferencesRepository
                        .findById(userId)
                        .orElse(null);

        if (preferences == null) {
            return true;
        }

        if (!preferences.isNotificationsEnabled()) {
            return false;
        }

        return switch (type) {
            case GROUP_INVITATION,
                 GROUP_ACTIVITY ->
                    preferences.isGroupActivityEnabled();

            case NEW_RESTAURANT ->
                    preferences.isNewRestaurantsEnabled();

            case RESTAURANT_STATUS_CHANGED ->
                    preferences.isRestaurantStatusEnabled();

            case RESTAURANT_RATED ->
                    preferences.isRatingsEnabled();
        };
    }

    private RestaurantContext getRestaurantContext(
            UUID groupId,
            UUID groupRestaurantId
    ) {
        RestaurantGroup group =
                getGroup(groupId);

        GroupRestaurant groupRestaurant =
                groupRestaurantRepository
                        .findByIdAndGroupId(
                                groupRestaurantId,
                                groupId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "El restaurante del grupo no existe."
                                )
                        );

        Restaurant restaurant =
                restaurantRepository
                        .findById(
                                groupRestaurant.getRestaurantId()
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "El restaurante no existe."
                                )
                        );

        return new RestaurantContext(
                group,
                restaurant
        );
    }

    private RestaurantGroup getGroup(
            UUID groupId
    ) {
        return restaurantGroupRepository
                .findById(groupId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "El grupo no existe."
                        )
                );
    }

    private User getUser(
            UUID userId
    ) {
        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "El usuario no existe."
                        )
                );
    }

    private void validateUserExists(
            UUID userId
    ) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "El usuario no existe."
            );
        }
    }

    private String restaurantTargetUrl(
            UUID groupId,
            UUID groupRestaurantId
    ) {
        return "/groups/"
                + groupId
                + "/restaurants/"
                + groupRestaurantId;
    }

    private String getStatusLabel(
            GroupRestaurantStatus status
    ) {
        return switch (status) {
            case WANT_TO_GO ->
                    "quiero ir";

            case VISITED ->
                    "visitado";

            case FAVORITE ->
                    "favorito";

            case WANT_TO_REPEAT ->
                    "quiero repetir";

            case DO_NOT_REPEAT ->
                    "no repetiría";

            case ARCHIVED ->
                    "archivado";
        };
    }

    private record RestaurantContext(
            RestaurantGroup group,
            Restaurant restaurant
    ) {
    }
}