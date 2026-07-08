package com.pauluna.mesa.group.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.api.UpdateGroupRequest;
import com.pauluna.mesa.group.domain.CollaborationRequestStatus;
import com.pauluna.mesa.group.domain.GroupCollaborationRequest;
import com.pauluna.mesa.group.domain.GroupMember;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupCollaborationRequestRepository;
import com.pauluna.mesa.group.infrastructure.GroupFollowerRepository;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.restaurant.domain.RestaurantProposal;
import com.pauluna.mesa.restaurant.domain.RestaurantProposalStatus;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantProposalRepository;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    private static final UUID GROUP_ID = UUID.randomUUID();
    private static final UUID OWNER_ID = UUID.randomUUID();
    private static final UUID MEMBER_ID = UUID.randomUUID();

    @Mock
    private RestaurantGroupRepository groupRepository;

    @Mock
    private GroupMemberRepository memberRepository;

    @Mock
    private GroupFollowerRepository followerRepository;

    @Mock
    private GroupCollaborationRequestRepository collaborationRequestRepository;

    @Mock
    private RestaurantProposalRepository restaurantProposalRepository;

    @Mock
    private UserRepository userRepository;

    private GroupService service;

    @BeforeEach
    void setUp() {
        service = new GroupService(
                groupRepository,
                memberRepository,
                followerRepository,
                collaborationRequestRepository,
                restaurantProposalRepository,
                userRepository
        );
    }

    @Test
    void publishingPrivateGroupConvertsMembersIntoContributors() {
        RestaurantGroup group = mock(RestaurantGroup.class);
        GroupMember owner = mock(GroupMember.class);
        GroupMember member = mock(GroupMember.class);

        prepareOwnerAccess(group, owner);
        when(group.getPrivacy()).thenReturn(GroupPrivacy.PRIVATE);
        when(groupRepository.saveAndFlush(group)).thenReturn(group);
        when(memberRepository.findAllByGroupIdOrderByJoinedAtAsc(GROUP_ID))
                .thenReturn(List.of(owner, member));

        service.updateGroup(
                GROUP_ID,
                new UpdateGroupRequest(
                        "Grupo público",
                        null,
                        "Girona",
                        GroupPrivacy.PUBLIC,
                        true
                ),
                OWNER_ID
        );

        verify(owner).becomeContributor();
        verify(member).becomeContributor();
        verify(memberRepository).saveAll(List.of(owner, member));
        verify(memberRepository).flush();
    }

    @Test
    void privatizingPublicGroupConvertsMembersAndCancelsPendingWork() {
        RestaurantGroup group = mock(RestaurantGroup.class);
        GroupMember owner = mock(GroupMember.class);
        GroupMember collaborator = mock(GroupMember.class);
        GroupCollaborationRequest pendingRequest =
                mock(GroupCollaborationRequest.class);
        RestaurantProposal pendingProposal =
                mock(RestaurantProposal.class);

        prepareOwnerAccess(group, owner);
        when(group.getPrivacy()).thenReturn(GroupPrivacy.PUBLIC);
        when(groupRepository.saveAndFlush(group)).thenReturn(group);
        when(memberRepository.findAllByGroupIdOrderByJoinedAtAsc(GROUP_ID))
                .thenReturn(List.of(owner, collaborator));
        when(collaborationRequestRepository.findAllByGroupIdAndStatus(
                GROUP_ID,
                CollaborationRequestStatus.PENDING
        )).thenReturn(List.of(pendingRequest));
        when(restaurantProposalRepository.findAllByGroupIdAndStatus(
                GROUP_ID,
                RestaurantProposalStatus.PENDING
        )).thenReturn(List.of(pendingProposal));

        service.updateGroup(
                GROUP_ID,
                new UpdateGroupRequest(
                        "Grupo privado",
                        null,
                        "Girona",
                        GroupPrivacy.PRIVATE,
                        false
                ),
                OWNER_ID
        );

        verify(owner).becomeMember();
        verify(collaborator).becomeMember();
        verify(pendingRequest).cancel();
        verify(collaborationRequestRepository)
                .saveAll(List.of(pendingRequest));
        verify(collaborationRequestRepository).flush();
        verify(pendingProposal).cancel();
        verify(restaurantProposalRepository)
                .saveAll(List.of(pendingProposal));
        verify(restaurantProposalRepository).flush();
    }

    @Test
    void publicNonOwnerCannotEditRestaurantsEvenWithLegacyMemberRole() {
        RestaurantGroup group = mock(RestaurantGroup.class);
        GroupMember membership = mock(GroupMember.class);

        when(userRepository.existsById(MEMBER_ID)).thenReturn(true);
        when(groupRepository.findById(GROUP_ID))
                .thenReturn(Optional.of(group));
        when(memberRepository.existsByGroupIdAndUserId(
                GROUP_ID,
                MEMBER_ID
        )).thenReturn(true);
        when(memberRepository.findByGroupIdAndUserId(
                GROUP_ID,
                MEMBER_ID
        )).thenReturn(Optional.of(membership));
        when(group.getPrivacy()).thenReturn(GroupPrivacy.PUBLIC);
        when(membership.getRole()).thenReturn(GroupRole.MEMBER);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.validateRestaurantManagementAccess(
                        GROUP_ID,
                        MEMBER_ID
                )
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    private void prepareOwnerAccess(
            RestaurantGroup group,
            GroupMember owner
    ) {
        when(userRepository.existsById(OWNER_ID)).thenReturn(true);
        when(groupRepository.findById(GROUP_ID))
                .thenReturn(Optional.of(group));
        when(memberRepository.existsByGroupIdAndUserId(
                GROUP_ID,
                OWNER_ID
        )).thenReturn(true);
        when(memberRepository.findByGroupIdAndUserId(
                GROUP_ID,
                OWNER_ID
        )).thenReturn(Optional.of(owner));
        when(owner.getRole()).thenReturn(GroupRole.OWNER);
    }
}
