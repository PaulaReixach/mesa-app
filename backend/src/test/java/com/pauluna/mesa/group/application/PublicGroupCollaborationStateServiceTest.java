package com.pauluna.mesa.group.application;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pauluna.mesa.group.api.PublicGroupCollaborationStateResponse;
import com.pauluna.mesa.group.domain.GroupInvitation;
import com.pauluna.mesa.group.domain.GroupInvitationStatus;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupCollaborationRequestRepository;
import com.pauluna.mesa.group.infrastructure.GroupInvitationRepository;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@ExtendWith(MockitoExtension.class)
class PublicGroupCollaborationStateServiceTest {

    private static final UUID GROUP_ID = UUID.randomUUID();
    private static final UUID OWNER_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();

    @Mock
    private RestaurantGroupRepository groupRepository;

    @Mock
    private GroupMemberRepository memberRepository;

    @Mock
    private GroupCollaborationRequestRepository requestRepository;

    @Mock
    private GroupInvitationRepository invitationRepository;

    @Mock
    private UserRepository userRepository;

    private PublicGroupCollaborationStateService service;

    @BeforeEach
    void setUp() {
        service = new PublicGroupCollaborationStateService(
                groupRepository,
                memberRepository,
                requestRepository,
                invitationRepository,
                userRepository
        );
    }

    @Test
    void exposesPendingInvitationInsteadOfCollaborationRequestAction() {
        RestaurantGroup group = mock(RestaurantGroup.class);
        GroupInvitation invitation = mock(GroupInvitation.class);

        when(userRepository.existsById(USER_ID)).thenReturn(true);
        when(groupRepository.findById(GROUP_ID))
                .thenReturn(Optional.of(group));
        when(group.getPrivacy()).thenReturn(GroupPrivacy.PUBLIC);
        when(group.getOwnerUserId()).thenReturn(OWNER_ID);
        when(group.isAcceptingCollaborators()).thenReturn(true);
        when(memberRepository.findByGroupIdAndUserId(GROUP_ID, USER_ID))
                .thenReturn(Optional.empty());
        when(invitationRepository
                .findByGroupIdAndInvitedUserIdAndStatus(
                        GROUP_ID,
                        USER_ID,
                        GroupInvitationStatus.PENDING
                ))
                .thenReturn(Optional.of(invitation));
        when(requestRepository
                .findFirstByGroupIdAndUserIdOrderByCreatedAtDesc(
                        GROUP_ID,
                        USER_ID
                ))
                .thenReturn(Optional.empty());

        PublicGroupCollaborationStateResponse response =
                service.getState(GROUP_ID, USER_ID);

        assertTrue(response.invitationPending());
        assertFalse(response.collaborating());
    }
}
