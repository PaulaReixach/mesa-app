package com.pauluna.mesa.group.application;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.api.GroupMemberResponse;
import com.pauluna.mesa.group.domain.GroupMember;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional(readOnly = true)
public class PublicGroupMemberService {

    private final RestaurantGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;

    public PublicGroupMemberService(
            RestaurantGroupRepository groupRepository,
            GroupMemberRepository memberRepository,
            UserRepository userRepository
    ) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    public List<GroupMemberResponse> getCollaborators(UUID groupId) {
        RestaurantGroup group = groupRepository
                .findById(groupId)
                .filter(candidate -> candidate.getPrivacy() == GroupPrivacy.PUBLIC)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        List<GroupMember> memberships = memberRepository
                .findAllByGroupIdOrderByJoinedAtAsc(group.getId())
                .stream()
                .filter(membership ->
                        membership.getRole() == GroupRole.OWNER
                                || membership.getRole() == GroupRole.CONTRIBUTOR
                )
                .toList();

        Set<UUID> userIds = memberships
                .stream()
                .map(GroupMember::getUserId)
                .collect(Collectors.toSet());

        Map<UUID, User> usersById = userRepository
                .findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(
                        User::getId,
                        Function.identity()
                ));

        return memberships
                .stream()
                .sorted(
                        Comparator
                                .comparingInt(PublicGroupMemberService::roleOrder)
                                .thenComparing(GroupMember::getJoinedAt)
                )
                .map(membership ->
                        GroupMemberResponse.from(
                                membership,
                                getUser(usersById, membership.getUserId())
                        )
                )
                .toList();
    }

    private static int roleOrder(GroupMember membership) {
        return membership.getRole() == GroupRole.OWNER ? 0 : 1;
    }

    private User getUser(
            Map<UUID, User> usersById,
            UUID userId
    ) {
        User user = usersById.get(userId);

        if (user == null) {
            throw new UserNotFoundException(userId);
        }

        return user;
    }
}
