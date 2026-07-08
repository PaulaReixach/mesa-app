package com.pauluna.mesa.group.application;

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

import com.pauluna.mesa.group.api.GroupResponse;
import com.pauluna.mesa.group.domain.CollaborationRequestStatus;
import com.pauluna.mesa.group.domain.GroupCollaborationRequest;
import com.pauluna.mesa.group.domain.GroupMember;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.group.infrastructure.GroupCollaborationRequestRepository;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.restaurant.application.RestaurantProposalService;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRatingRepository;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@ExtendWith(MockitoExtension.class)
class GroupMemberServiceTest {

    private static final UUID GROUP_ID = UUID.randomUUID();
    private static final UUID OWNER_ID = UUID.randomUUID();
    private static final UUID MEMBER_ID = UUID.randomUUID();

    @Mock
    private GroupService groupService;

    @Mock
    private GroupMemberRepository memberRepository;

    @Mock
    private GroupCollaborationRequestRepository collaborationRequestRepository;

    @Mock
    private GroupRestaurantRepository groupRestaurantRepository;

    @Mock
    private RestaurantRatingRepository restaurantRatingRepository;

    @Mock
    private RestaurantProposalService restaurantProposalService;

    @Mock
    private UserRepository userRepository;

    private GroupMemberService service;

    @BeforeEach
    void setUp() {
        service = new GroupMemberService(
                groupService,
                memberRepository,
                collaborationRequestRepository,
                groupRestaurantRepository,
                restaurantRatingRepository,
                restaurantProposalService,
                userRepository
        );
    }

    @Test
    void removingPublicCollaboratorClosesAcceptedRequestAndPendingWork() {
        GroupMember membership = mock(GroupMember.class);
        GroupCollaborationRequest acceptedRequest =
                mock(GroupCollaborationRequest.class);

        when(groupService.getGroup(GROUP_ID, OWNER_ID))
                .thenReturn(groupResponse(GroupPrivacy.PUBLIC));
        when(memberRepository.findByGroupIdAndUserId(
                GROUP_ID,
                MEMBER_ID
        )).thenReturn(Optional.of(membership));
        when(membership.getRole()).thenReturn(GroupRole.MEMBER);
        when(groupRestaurantRepository
                .findAllByGroupIdOrderByCreatedAtDesc(GROUP_ID))
                .thenReturn(List.of());
        when(collaborationRequestRepository
                .findFirstByGroupIdAndUserIdOrderByCreatedAtDesc(
                        GROUP_ID,
                        MEMBER_ID
                ))
                .thenReturn(Optional.of(acceptedRequest));
        when(acceptedRequest.getStatus())
                .thenReturn(CollaborationRequestStatus.ACCEPTED);

        service.removeMember(
                GROUP_ID,
                MEMBER_ID,
                OWNER_ID
        );

        verify(restaurantProposalService)
                .cancelPendingForCollaborator(GROUP_ID, MEMBER_ID);
        verify(acceptedRequest).leave();
        verify(collaborationRequestRepository).save(acceptedRequest);
        verify(memberRepository).delete(membership);
    }

    @Test
    void privateMemberCanLeaveGroup() {
        GroupMember membership = mock(GroupMember.class);

        when(groupService.getGroup(GROUP_ID, MEMBER_ID))
                .thenReturn(groupResponse(GroupPrivacy.PRIVATE));
        when(memberRepository.findByGroupIdAndUserId(
                GROUP_ID,
                MEMBER_ID
        )).thenReturn(Optional.of(membership));
        when(membership.getRole()).thenReturn(GroupRole.MEMBER);

        service.leaveGroup(GROUP_ID, MEMBER_ID);

        verify(memberRepository).delete(membership);
    }

    @Test
    void ownerCannotLeaveGroup() {
        GroupMember membership = mock(GroupMember.class);

        when(groupService.getGroup(GROUP_ID, OWNER_ID))
                .thenReturn(groupResponse(GroupPrivacy.PRIVATE));
        when(memberRepository.findByGroupIdAndUserId(
                GROUP_ID,
                OWNER_ID
        )).thenReturn(Optional.of(membership));
        when(membership.getRole()).thenReturn(GroupRole.OWNER);
        when(membership.getGroupId()).thenReturn(GROUP_ID);

        assertThrows(
                GroupOwnerCannotBeRemovedException.class,
                () -> service.leaveGroup(GROUP_ID, OWNER_ID)
        );
    }

    private GroupResponse groupResponse(GroupPrivacy privacy) {
        return new GroupResponse(
                GROUP_ID,
                "Grupo",
                null,
                null,
                "Girona",
                privacy,
                true,
                GroupRole.OWNER,
                0,
                OWNER_ID,
                null,
                null
        );
    }
}
