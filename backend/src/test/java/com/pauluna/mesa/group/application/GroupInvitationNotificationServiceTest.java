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
import com.pauluna.mesa.notification.application.NotificationCreatedEvent;
import com.pauluna.mesa.notification.domain.AppNotification;
import com.pauluna.mesa.notification.domain.NotificationType;
import com.pauluna.mesa.notification.infrastructure.NotificationRepository;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserNotificationPreferencesRepository;

@ExtendWith(MockitoExtension.class)
class GroupInvitationNotificationServiceTest {

    private static final UUID GROUP_ID = UUID.randomUUID();
    private static final UUID OWNER_ID = UUID.randomUUID();
    private static final UUID INVITED_USER_ID = UUID.randomUUID();

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserNotificationPreferencesRepository preferencesRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private GroupInvitationNotificationService service;

    @BeforeEach
    void setUp() {
        service = new GroupInvitationNotificationService(
                notificationRepository,
                preferencesRepository,
                eventPublisher
        );

        when(notificationRepository.saveAndFlush(any(AppNotification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void notifiesInvitedUserWithInvitationTarget() {
        RestaurantGroup group = mock(RestaurantGroup.class);
        User invitedUser = mock(User.class);
        User owner = mock(User.class);

        when(group.getName()).thenReturn("Rutas de Girona");
        when(invitedUser.getId()).thenReturn(INVITED_USER_ID);
        when(owner.getId()).thenReturn(OWNER_ID);
        when(owner.getName()).thenReturn("Paula");
        when(preferencesRepository.findById(INVITED_USER_ID))
                .thenReturn(Optional.empty());

        service.notifyInvitationCreated(
                group,
                invitedUser,
                owner
        );

        AppNotification notification = captureNotification();

        assertEquals(INVITED_USER_ID, notification.getUserId());
        assertEquals(OWNER_ID, notification.getActorUserId());
        assertEquals(NotificationType.GROUP_INVITATION, notification.getType());
        assertEquals("Nueva invitación a grupo", notification.getTitle());
        assertEquals("/group-invitations", notification.getTargetUrl());
        verify(eventPublisher)
                .publishEvent(any(NotificationCreatedEvent.class));
    }

    @Test
    void notifiesOwnerWhenInvitationIsAccepted() {
        RestaurantGroup group = mock(RestaurantGroup.class);
        User invitedUser = mock(User.class);
        User owner = mock(User.class);

        when(group.getId()).thenReturn(GROUP_ID);
        when(group.getName()).thenReturn("Rutas de Girona");
        when(invitedUser.getId()).thenReturn(INVITED_USER_ID);
        when(invitedUser.getName()).thenReturn("Ana");
        when(owner.getId()).thenReturn(OWNER_ID);
        when(preferencesRepository.findById(OWNER_ID))
                .thenReturn(Optional.empty());

        service.notifyInvitationAccepted(
                group,
                invitedUser,
                owner
        );

        AppNotification notification = captureNotification();

        assertEquals(OWNER_ID, notification.getUserId());
        assertEquals(INVITED_USER_ID, notification.getActorUserId());
        assertEquals(NotificationType.GROUP_ACTIVITY, notification.getType());
        assertEquals(
                "Ana ha aceptado tu invitación",
                notification.getTitle()
        );
        assertEquals(
                "/groups/" + GROUP_ID,
                notification.getTargetUrl()
        );
    }

    private AppNotification captureNotification() {
        ArgumentCaptor<AppNotification> captor =
                ArgumentCaptor.forClass(AppNotification.class);
        verify(notificationRepository).saveAndFlush(captor.capture());
        return captor.getValue();
    }
}
