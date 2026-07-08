package com.pauluna.mesa.group.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
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

import com.pauluna.mesa.group.api.CreateGroupInvitationRequest;
import com.pauluna.mesa.group.api.GroupInvitationResponse;
import com.pauluna.mesa.group.domain.CollaborationRequestStatus;
import com.pauluna.mesa.group.domain.GroupInvitation;
import com.pauluna.mesa.group.domain.GroupInvitationStatus;
import com.pauluna.mesa.group.domain.GroupMember;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupCollaborationRequestRepository;
import com.pauluna.mesa.group.infrastructure.GroupInvitationRepository;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.user.application.PrivacyPreferencesService;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@ExtendWith(MockitoExtension.class)
class GroupInvitationServiceTest {

    private static final UUID GROUP_ID = UUID.randomUUID();
    private static final UUID INVITATION_ID = UUID.randomUUID();
    private static final UUID OWNER_ID = UUID.randomUUID();
    private static final UUID INVITED_USER_ID = UUID.randomUUID();

    @Mock
    private GroupService groupService;

    @Mock
    private RestaurantGroupRepository groupRepository;

    @Mock
    private GroupMemberRepository memberRepository;

    @Mock
    private GroupInvitationRepository invitationRepository;

    @Mock
    private GroupCollaborationRequestRepository collaborationRequestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PrivacyPreferencesService privacyPreferencesService;

    @Mock
    private GroupInvitationNotificationService notificationService;

    private GroupInvitationService service;

    @BeforeEach
    void setUp() {
        service = new GroupInvitationService(
                groupService,
                groupRepository,
                memberRepository,
                invitationRepository,
                collaborationRequestRepository,
                userRepository,
                privacyPreferencesService,
                notificationService
        );
    }

    @Test
    void creatingInvitationDoesNotCreateMembership() {
        RestaurantGroup group = group(GroupPrivacy.PRIVATE);
        User owner = user(OWNER_ID, "Paula", "paula");
        User invitedUser = user(
                INVITED_USER_ID,
                "Ana",
                "ana"
        );

        when(groupRepository.findById(GROUP_ID))
                .thenReturn(Optional.of(group));
        when(userRepository.findById(OWNER_ID))
                .thenReturn(Optional.of(owner));
        when(userRepository.findByUsernameIgnoreCase("ana"))
                .thenReturn(Optional.of(invitedUser));
        when(memberRepository.existsByGroupIdAndUserId(
                GROUP_ID,
                INVITED_USER_ID
        )).thenReturn(false);
        when(invitationRepository
                .findByGroupIdAndInvitedUserIdAndStatus(
                        GROUP_ID,
                        INVITED_USER_ID,
                        GroupInvitationStatus.PENDING
                ))
                .thenReturn(Optional.empty());
        when(collaborationRequestRepository
                .findByGroupIdAndUserIdAndStatus(
                        GROUP_ID,
                        INVITED_USER_ID,
                        CollaborationRequestStatus.PENDING
                ))
                .thenReturn(Optional.empty());
        when(privacyPreferencesService
                .areGroupInvitationsEnabled(INVITED_USER_ID))
                .thenReturn(true);
        when(invitationRepository.saveAndFlush(any(GroupInvitation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        GroupInvitationResponse response = service.createInvitation(
                GROUP_ID,
                new CreateGroupInvitationRequest("@ana"),
                OWNER_ID
        );

        assertEquals(GroupInvitationStatus.PENDING, response.status());
        verify(memberRepository, never()).save(any(GroupMember.class));
        verify(notificationService).notifyInvitationCreated(
                group,
                invitedUser,
                owner
        );
    }

    @Test
    void acceptingPublicInvitationCreatesContributor() {
        RestaurantGroup group = group(GroupPrivacy.PUBLIC);
        User owner = user(OWNER_ID, "Paula", "paula");
        User invitedUser = user(
                INVITED_USER_ID,
                "Ana",
                "ana"
        );
        GroupInvitation invitation = responseInvitation();

        prepareInvitationAcceptance(
                invitation,
                group,
                owner,
                invitedUser
        );

        service.acceptInvitation(INVITATION_ID, INVITED_USER_ID);

        ArgumentCaptor<GroupMember> memberCaptor =
                ArgumentCaptor.forClass(GroupMember.class);
        verify(memberRepository).save(memberCaptor.capture());

        assertEquals(
                GroupRole.CONTRIBUTOR,
                memberCaptor.getValue().getRole()
        );
        verify(invitation).accept();
        verify(notificationService).notifyInvitationAccepted(
                group,
                invitedUser,
                owner
        );
    }

    @Test
    void acceptingPrivateInvitationCreatesMember() {
        RestaurantGroup group = group(GroupPrivacy.PRIVATE);
        User owner = user(OWNER_ID, "Paula", "paula");
        User invitedUser = user(
                INVITED_USER_ID,
                "Ana",
                "ana"
        );
        GroupInvitation invitation = responseInvitation();

        prepareInvitationAcceptance(
                invitation,
                group,
                owner,
                invitedUser
        );

        service.acceptInvitation(INVITATION_ID, INVITED_USER_ID);

        ArgumentCaptor<GroupMember> memberCaptor =
                ArgumentCaptor.forClass(GroupMember.class);
        verify(memberRepository).save(memberCaptor.capture());

        assertEquals(
                GroupRole.MEMBER,
                memberCaptor.getValue().getRole()
        );
    }

    @Test
    void rejectingInvitationDoesNotCreateMembership() {
        RestaurantGroup group = group(GroupPrivacy.PUBLIC);
        User owner = user(OWNER_ID, "Paula", "paula");
        User invitedUser = user(
                INVITED_USER_ID,
                "Ana",
                "ana"
        );
        GroupInvitation invitation = responseInvitation();

        when(userRepository.existsById(INVITED_USER_ID))
                .thenReturn(true);
        when(invitationRepository.findByIdAndInvitedUserId(
                INVITATION_ID,
                INVITED_USER_ID
        )).thenReturn(Optional.of(invitation));
        when(groupRepository.findById(GROUP_ID))
                .thenReturn(Optional.of(group));
        when(userRepository.findById(INVITED_USER_ID))
                .thenReturn(Optional.of(invitedUser));
        when(userRepository.findById(OWNER_ID))
                .thenReturn(Optional.of(owner));
        when(invitationRepository.saveAndFlush(invitation))
                .thenReturn(invitation);

        service.rejectInvitation(INVITATION_ID, INVITED_USER_ID);

        verify(invitation).reject();
        verify(memberRepository, never()).save(any(GroupMember.class));
        verify(notificationService).notifyInvitationRejected(
                group,
                invitedUser,
                owner
        );
    }

    @Test
    void ownerCanCancelPendingInvitation() {
        GroupInvitation invitation = mock(GroupInvitation.class);
        when(invitation.getStatus())
                .thenReturn(GroupInvitationStatus.PENDING);
        when(invitationRepository.findByIdAndGroupId(
                INVITATION_ID,
                GROUP_ID
        )).thenReturn(Optional.of(invitation));

        service.cancelInvitation(
                GROUP_ID,
                INVITATION_ID,
                OWNER_ID
        );

        verify(groupService).validateOwnerAccess(GROUP_ID, OWNER_ID);
        verify(invitation).cancel();
        verify(invitationRepository).saveAndFlush(invitation);
    }

    private void prepareInvitationAcceptance(
            GroupInvitation invitation,
            RestaurantGroup group,
            User owner,
            User invitedUser
    ) {
        when(userRepository.existsById(INVITED_USER_ID))
                .thenReturn(true);
        when(invitationRepository.findByIdAndInvitedUserId(
                INVITATION_ID,
                INVITED_USER_ID
        )).thenReturn(Optional.of(invitation));
        when(groupRepository.findById(GROUP_ID))
                .thenReturn(Optional.of(group));
        when(userRepository.findById(INVITED_USER_ID))
                .thenReturn(Optional.of(invitedUser));
        when(userRepository.findById(OWNER_ID))
                .thenReturn(Optional.of(owner));
        when(memberRepository.existsByGroupIdAndUserId(
                GROUP_ID,
                INVITED_USER_ID
        )).thenReturn(false);
        when(invitationRepository.saveAndFlush(invitation))
                .thenReturn(invitation);
    }

    private GroupInvitation responseInvitation() {
        GroupInvitation invitation = mock(GroupInvitation.class);
        when(invitation.getId()).thenReturn(INVITATION_ID);
        when(invitation.getGroupId()).thenReturn(GROUP_ID);
        when(invitation.getInvitedUserId()).thenReturn(INVITED_USER_ID);
        when(invitation.getInvitedByUserId()).thenReturn(OWNER_ID);
        when(invitation.getStatus())
                .thenReturn(GroupInvitationStatus.PENDING);
        return invitation;
    }

    private RestaurantGroup group(GroupPrivacy privacy) {
        RestaurantGroup group = mock(RestaurantGroup.class);
        when(group.getId()).thenReturn(GROUP_ID);
        when(group.getName()).thenReturn("Rutas de Girona");
        when(group.getPrivacy()).thenReturn(privacy);
        return group;
    }

    private User user(
            UUID id,
            String name,
            String username
    ) {
        User user = mock(User.class);
        when(user.getId()).thenReturn(id);
        when(user.getName()).thenReturn(name);
        when(user.getUsername()).thenReturn(username);
        return user;
    }
}
