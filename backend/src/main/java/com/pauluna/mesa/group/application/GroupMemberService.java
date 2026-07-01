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

import com.pauluna.mesa.group.api.AddGroupMemberRequest;
import com.pauluna.mesa.group.api.GroupMemberResponse;
import com.pauluna.mesa.group.domain.GroupMember;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.user.application.UserNotFoundByUsernameException;
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class GroupMemberService {

    private final GroupService groupService;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public GroupMemberService(
            GroupService groupService,
            GroupMemberRepository groupMemberRepository,
            UserRepository userRepository
    ) {
        this.groupService = groupService;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<GroupMemberResponse> getMembers(
            UUID groupId,
            UUID requesterUserId
    ) {
        groupService.validateMemberAccess(
                groupId,
                requesterUserId
        );

        List<GroupMember> memberships =
                groupMemberRepository
                        .findAllByGroupIdOrderByJoinedAtAsc(
                                groupId
                        );

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
                                .comparingInt(
                                        GroupMemberService
                                                ::roleOrder
                                )
                                .thenComparing(
                                        GroupMember::getJoinedAt
                                )
                )
                .map(membership ->
                        GroupMemberResponse.from(
                                membership,
                                getUserFromMap(
                                        usersById,
                                        membership.getUserId()
                                )
                        )
                )
                .toList();
    }

    public GroupMemberResponse addMember(
            UUID groupId,
            AddGroupMemberRequest request,
            UUID requesterUserId
    ) {
        groupService.validateOwnerAccess(
                groupId,
                requesterUserId
        );

        String username = request.username().trim();

        User invitedUser = userRepository
                .findByUsernameIgnoreCase(username)
                .orElseThrow(() ->
                        new UserNotFoundByUsernameException(
                                username
                        )
                );

        boolean alreadyBelongsToGroup =
                groupMemberRepository
                        .existsByGroupIdAndUserId(
                                groupId,
                                invitedUser.getId()
                        );

        if (alreadyBelongsToGroup) {
            throw new GroupMemberAlreadyExistsException(
                    groupId,
                    invitedUser.getUsername()
            );
        }

        GroupMember groupMember = new GroupMember(
                groupId,
                invitedUser.getId(),
                GroupRole.MEMBER
        );

        GroupMember savedMembership =
                groupMemberRepository.save(groupMember);

        return GroupMemberResponse.from(
                savedMembership,
                invitedUser
        );
    }

    public void removeMember(
            UUID groupId,
            UUID memberUserId,
            UUID requesterUserId
    ) {
        groupService.validateOwnerAccess(
                groupId,
                requesterUserId
        );

        GroupMember membership = groupMemberRepository
                .findByGroupIdAndUserId(
                        groupId,
                        memberUserId
                )
                .orElseThrow(() ->
                        new GroupMemberNotFoundException(
                                groupId,
                                memberUserId
                        )
                );

        if (membership.getRole() == GroupRole.OWNER) {
            throw new GroupOwnerCannotBeRemovedException(
                    groupId
            );
        }

        groupMemberRepository.delete(membership);
    }

    private static int roleOrder(GroupMember membership) {
        return membership.getRole() == GroupRole.OWNER
                ? 0
                : 1;
    }

    private User getUserFromMap(
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