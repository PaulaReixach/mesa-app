package com.pauluna.mesa.group.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.api.CreateGroupRequest;
import com.pauluna.mesa.group.api.GroupResponse;
import com.pauluna.mesa.group.api.UpdateGroupRequest;
import com.pauluna.mesa.group.domain.GroupMember;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class GroupService {

    private final RestaurantGroupRepository restaurantGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public GroupService(
            RestaurantGroupRepository restaurantGroupRepository,
            GroupMemberRepository groupMemberRepository,
            UserRepository userRepository
    ) {
        this.restaurantGroupRepository = restaurantGroupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
    }

    public GroupResponse createGroup(
            CreateGroupRequest request,
            UUID ownerUserId
    ) {
        validateUserExists(ownerUserId);

        RestaurantGroup restaurantGroup = new RestaurantGroup(
                request.name().trim(),
                normalizeOptionalValue(request.description()),
                normalizeOptionalValue(request.imageUrl()),
                normalizeOptionalValue(request.city()),
                request.privacy(),
                ownerUserId
        );

        RestaurantGroup savedGroup =
                restaurantGroupRepository.save(restaurantGroup);

        GroupMember ownerMembership = new GroupMember(
                savedGroup.getId(),
                ownerUserId,
                GroupRole.OWNER
        );

        groupMemberRepository.save(ownerMembership);

        return GroupResponse.from(savedGroup);
    }

    public GroupResponse updateGroup(
            UUID groupId,
            UpdateGroupRequest request,
            UUID userId
    ) {
        validateOwnerAccess(groupId, userId);

        RestaurantGroup restaurantGroup =
                restaurantGroupRepository
                        .findById(groupId)
                        .orElseThrow(() ->
                                new GroupNotFoundException(groupId)
                        );

        restaurantGroup.updateDetails(
                request.name().trim(),
                normalizeOptionalValue(request.description()),
                normalizeOptionalValue(request.city()),
                request.privacy()
        );

        return GroupResponse.from(
                restaurantGroupRepository.saveAndFlush(
                        restaurantGroup
                )
        );
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getGroups(UUID userId) {
        validateUserExists(userId);

        return restaurantGroupRepository
                .findAllByMemberUserId(userId)
                .stream()
                .map(GroupResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroup(
            UUID groupId,
            UUID userId
    ) {
        return GroupResponse.from(
                getAccessibleGroup(groupId, userId)
        );
    }

    @Transactional(readOnly = true)
    public void validateMemberAccess(
            UUID groupId,
            UUID userId
    ) {
        getAccessibleGroup(groupId, userId);
    }

    @Transactional(readOnly = true)
    public void validateOwnerAccess(
            UUID groupId,
            UUID userId
    ) {
        getAccessibleGroup(groupId, userId);

        GroupMember membership = groupMemberRepository
                .findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() ->
                        new GroupAccessDeniedException(groupId)
                );

        if (membership.getRole() != GroupRole.OWNER) {
            throw new GroupOwnerAccessRequiredException(groupId);
        }
    }

    private RestaurantGroup getAccessibleGroup(
            UUID groupId,
            UUID userId
    ) {
        validateUserExists(userId);

        RestaurantGroup restaurantGroup = restaurantGroupRepository
                .findById(groupId)
                .orElseThrow(() ->
                        new GroupNotFoundException(groupId)
                );

        boolean belongsToGroup =
                groupMemberRepository.existsByGroupIdAndUserId(
                        groupId,
                        userId
                );

        if (!belongsToGroup) {
            throw new GroupAccessDeniedException(groupId);
        }

        return restaurantGroup;
    }

    private void validateUserExists(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }
    }

    private String normalizeOptionalValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
