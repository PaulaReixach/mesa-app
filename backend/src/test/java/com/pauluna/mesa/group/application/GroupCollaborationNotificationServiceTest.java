package com.pauluna.mesa.group.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.notification.application.NotificationCreatedEvent;
import com.pauluna.mesa.notification.domain.AppNotification;
import com.pauluna.mesa.notification.domain.NotificationType;
import com.pauluna.mesa.notification.infrastructure.NotificationRepository;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserNotificationPreferencesRepository;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@ExtendWith(MockitoExtension.class)
class GroupCollaborationNotificationServiceTest {

    private static final UUID GROUP_ID = UUID.randomUUID();
    private static final UUID OWNER_ID = UUID.randomUUID();
    private static final UUID REQUESTER_ID = UUID.randomUUID();

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserNotificationPreferencesRepository preferencesRepository;

    @Mock
    private RestaurantGroupRepository groupRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private GroupCollaborationNotificationService service;

    @BeforeEach
    void setUp() {
        service = new GroupCollaborationNotificationService(
                notificationRepository,
                preferencesRepository,
                groupRepository,
                userRepository,
                eventPublisher
        );

        when(notificationRepository.saveAndFlush(any(AppNotification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void notifiesOwnerWhenCollaborationIsRequested() {
        RestaurantGroup group = requestGroup();
        User requester = user(REQUESTER_ID, "Laura");

        when(groupRepository.findById(GROUP_ID))
                .thenReturn(Optional.of(group));
        when(userRepository.findById(REQUESTER_ID))
                .thenReturn(Optional.of(requester));
        when(preferencesRepository.findById(OWNER_ID))
                .thenReturn(Optional.empty());

        service.notifyRequestCreated(GROUP_ID, REQUESTER_ID);

        AppNotification notification = captureNotification();

        assertEquals(OWNER_ID, notification.getUserId());
        assertEquals(REQUESTER_ID, notification.getActorUserId());
        assertEquals(NotificationType.GROUP_ACTIVITY, notification.getType());
        assertEquals(
                "Nueva solicitud de colaboración",
                notification.getTitle()
        );
        assertEquals(
                "/groups/" + GROUP_ID + "/collaboration-requests",
                notification.getTargetUrl()
        );
        verify(eventPublisher)
                .publishEvent(any(NotificationCreatedEvent.class));
    }

    @Test
    void notifiesRequesterWhenCollaborationIsAccepted() {
        RestaurantGroup group = decisionGroup();
        User owner = user(OWNER_ID, "Paula");

        when(groupRepository.findById(GROUP_ID))
                .thenReturn(Optional.of(group));
        when(userRepository.findById(OWNER_ID))
                .thenReturn(Optional.of(owner));
        when(preferencesRepository.findById(REQUESTER_ID))
                .thenReturn(Optional.empty());

        service.notifyRequestAccepted(
                GROUP_ID,
                REQUESTER_ID,
                OWNER_ID
        );

        AppNotification notification = captureNotification();

        assertEquals(REQUESTER_ID, notification.getUserId());
        assertEquals(OWNER_ID, notification.getActorUserId());
        assertEquals(
                "Solicitud de colaboración aceptada",
                notification.getTitle()
        );
        assertEquals(
                "/groups/public/" + GROUP_ID,
                notification.getTargetUrl()
        );
    }

    private AppNotification captureNotification() {
        ArgumentCaptor<AppNotification> captor =
                ArgumentCaptor.forClass(AppNotification.class);
        verify(notificationRepository).saveAndFlush(captor.capture());
        return captor.getValue();
    }

    private RestaurantGroup requestGroup() {
        RestaurantGroup group = decisionGroup();
        when(group.getOwnerUserId()).thenReturn(OWNER_ID);
        return group;
    }

    private RestaurantGroup decisionGroup() {
        RestaurantGroup group = mock(RestaurantGroup.class);
        when(group.getName()).thenReturn("Rutas de Girona");
        return group;
    }

    private User user(UUID id, String name) {
        User user = mock(User.class);
        when(user.getId()).thenReturn(id);
        when(user.getName()).thenReturn(name);
        return user;
    }
}
