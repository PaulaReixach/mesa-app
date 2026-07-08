package com.pauluna.mesa.group.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pauluna.mesa.group.api.GroupMemberResponse;
import com.pauluna.mesa.group.domain.GroupMember;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@ExtendWith(MockitoExtension.class)
class PublicGroupMemberServiceTest {

    private static final UUID GROUP_ID = UUID.randomUUID();
    private static final UUID OWNER_ID = UUID.randomUUID();
    private static final UUID CONTRIBUTOR_ID = UUID.randomUUID();

    @Mock
    private RestaurantGroupRepository groupRepository;

    @Mock
    private GroupMemberRepository memberRepository;

    @Mock
    private UserRepository userRepository;

    private PublicGroupMemberService service;

    @BeforeEach
    void setUp() {
        service = new PublicGroupMemberService(
                groupRepository,
                memberRepository,
                userRepository
        );
    }

    @Test
    void returnsOnlyOwnerAndContributorsForPublicGroup() {
        RestaurantGroup group = mock(RestaurantGroup.class);
        GroupMember owner = publicMembership(
                UUID.randomUUID(),
                OWNER_ID,
                GroupRole.OWNER,
                Instant.parse("2026-01-01T10:00:00Z")
        );
        GroupMember contributor = publicMembership(
                UUID.randomUUID(),
                CONTRIBUTOR_ID,
                GroupRole.CONTRIBUTOR,
                Instant.parse("2026-01-02T10:00:00Z")
        );
        GroupMember legacyPrivateMember = mock(GroupMember.class);
        User ownerUser = user(OWNER_ID, "Paula", "paula");
        User contributorUser = user(CONTRIBUTOR_ID, "Marc", "marc");

        when(group.getId()).thenReturn(GROUP_ID);
        when(group.getPrivacy()).thenReturn(GroupPrivacy.PUBLIC);
        when(legacyPrivateMember.getRole()).thenReturn(GroupRole.MEMBER);
        when(groupRepository.findById(GROUP_ID)).thenReturn(Optional.of(group));
        when(memberRepository.findAllByGroupIdOrderByJoinedAtAsc(GROUP_ID))
                .thenReturn(List.of(owner, contributor, legacyPrivateMember));
        when(userRepository.findAllById(any()))
                .thenReturn(List.of(ownerUser, contributorUser));

        List<GroupMemberResponse> result = service.getCollaborators(GROUP_ID);

        assertEquals(2, result.size());
        assertEquals(GroupRole.OWNER, result.get(0).role());
        assertEquals(GroupRole.CONTRIBUTOR, result.get(1).role());
    }

    @Test
    void rejectsPrivateGroups() {
        RestaurantGroup group = mock(RestaurantGroup.class);

        when(group.getPrivacy()).thenReturn(GroupPrivacy.PRIVATE);
        when(groupRepository.findById(GROUP_ID)).thenReturn(Optional.of(group));

        assertThrows(
                GroupNotFoundException.class,
                () -> service.getCollaborators(GROUP_ID)
        );
    }

    private GroupMember publicMembership(
            UUID id,
            UUID userId,
            GroupRole role,
            Instant joinedAt
    ) {
        GroupMember membership = mock(GroupMember.class);
        when(membership.getId()).thenReturn(id);
        when(membership.getUserId()).thenReturn(userId);
        when(membership.getRole()).thenReturn(role);
        when(membership.getJoinedAt()).thenReturn(joinedAt);
        return membership;
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
        when(user.getAvatarUrl()).thenReturn(null);
        return user;
    }
}
