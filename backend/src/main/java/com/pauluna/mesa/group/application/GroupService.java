package com.pauluna.mesa.group.application;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.api.CreateGroupRequest;
import com.pauluna.mesa.group.api.GroupResponse;
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
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class GroupService {

    private final RestaurantGroupRepository restaurantGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupFollowerRepository groupFollowerRepository;
    private final GroupCollaborationRequestRepository collaborationRequestRepository;
    private final RestaurantProposalRepository restaurantProposalRepository;
    private final UserRepository userRepository;

    public GroupService(
            RestaurantGroupRepository restaurantGroupRepository,
            GroupMemberRepository groupMemberRepository,
            GroupFollowerRepository groupFollowerRepository,
            GroupCollaborationRequestRepository collaborationRequestRepository,
            RestaurantProposalRepository restaurantProposalRepository,
            UserRepository userRepository
    ) {
        this.restaurantGroupRepository = restaurantGroupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.groupFollowerRepository = groupFollowerRepository;
        this.collaborationRequestRepository = collaborationRequestRepository;
        this.restaurantProposalRepository = restaurantProposalRepository;
        this.userRepository = userRepository;
    }

    public GroupResponse createGroup(
            CreateGroupRequest request,
            UUID ownerUserId
    ) {
        validateUserExists(ownerUserId);

        boolean acceptingCollaborators =
                request.acceptingCollaborators() == null
                        || request.acceptingCollaborators();

        RestaurantGroup restaurantGroup = new RestaurantGroup(
                request.name().trim(),
                normalizeOptionalValue(request.description()),
                normalizeOptionalValue(request.imageUrl()),
                normalizeOptionalValue(request.city()),
                request.privacy(),
                acceptingCollaborators,
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

        return GroupResponse.from(
                savedGroup,
                GroupRole.OWNER,
                0
        );
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

        GroupPrivacy previousPrivacy = restaurantGroup.getPrivacy();
        GroupPrivacy newPrivacy = request.privacy();

        boolean acceptingCollaborators =
                request.acceptingCollaborators() == null
                        ? restaurantGroup.isAcceptingCollaborators()
                        : request.acceptingCollaborators();

        restaurantGroup.updateDetails(
                request.name().trim(),
                normalizeOptionalValue(request.description()),
                normalizeOptionalValue(request.city()),
                newPrivacy,
                acceptingCollaborators
        );

        if (previousPrivacy != newPrivacy) {
            normalizeMembershipsForPrivacy(groupId, newPrivacy);

            if (newPrivacy == GroupPrivacy.PRIVATE) {
                cancelPendingCollaborationRequests(groupId);
                cancelPendingRestaurantProposals(groupId);
            }
        }

        RestaurantGroup savedGroup =
                restaurantGroupRepository.saveAndFlush(
                        restaurantGroup
                );

        return GroupResponse.from(
                savedGroup,
                GroupRole.OWNER,
                getFollowerCount(savedGroup)
        );
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getGroups(UUID userId) {
        validateUserExists(userId);

        return restaurantGroupRepository
                .findAllByMemberUserId(userId)
                .stream()
                .map(group -> GroupResponse.from(
                        group,
                        getMembership(group.getId(), userId).getRole(),
                        getFollowerCount(group)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroup(
            UUID groupId,
            UUID userId
    ) {
        RestaurantGroup group = getAccessibleGroup(groupId, userId);
        GroupMember membership = getMembership(groupId, userId);

        return GroupResponse.from(
                group,
                membership.getRole(),
                getFollowerCount(group)
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
    public void validateContributorAccess(
            UUID groupId,
            UUID userId
    ) {
        RestaurantGroup group = getAccessibleGroup(groupId, userId);
        GroupMember membership = getMembership(groupId, userId);

        if (group.getPrivacy() != GroupPrivacy.PUBLIC
                || membership.getRole() == GroupRole.OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Solo las personas colaboradoras pueden proponer restaurantes."
            );
        }
    }

    @Transactional(readOnly = true)
    public void validateRestaurantManagementAccess(
            UUID groupId,
            UUID userId
    ) {
        RestaurantGroup group = getAccessibleGroup(groupId, userId);
        GroupMember membership = getMembership(groupId, userId);

        if (group.getPrivacy() == GroupPrivacy.PUBLIC
                && membership.getRole() != GroupRole.OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Solo la persona creadora puede editar directamente la lista pública."
            );
        }
    }

    @Transactional(readOnly = true)
    public void validateOwnerAccess(
            UUID groupId,
            UUID userId
    ) {
        getAccessibleGroup(groupId, userId);

        GroupMember membership = getMembership(groupId, userId);

        if (membership.getRole() != GroupRole.OWNER) {
            throw new GroupOwnerAccessRequiredException(groupId);
        }
    }

    private void normalizeMembershipsForPrivacy(
            UUID groupId,
            GroupPrivacy privacy
    ) {
        List<GroupMember> memberships = groupMemberRepository
                .findAllByGroupIdOrderByJoinedAtAsc(groupId);

        memberships.forEach(membership -> {
            if (privacy == GroupPrivacy.PUBLIC) {
                membership.becomeContributor();
            } else {
                membership.becomeMember();
            }
        });

        groupMemberRepository.saveAll(memberships);
        groupMemberRepository.flush();
    }

    private void cancelPendingCollaborationRequests(UUID groupId) {
        List<GroupCollaborationRequest> pendingRequests =
                collaborationRequestRepository.findAllByGroupIdAndStatus(
                        groupId,
                        CollaborationRequestStatus.PENDING
                );

        pendingRequests.forEach(GroupCollaborationRequest::cancel);

        if (!pendingRequests.isEmpty()) {
            collaborationRequestRepository.saveAll(pendingRequests);
            collaborationRequestRepository.flush();
        }
    }

    private void cancelPendingRestaurantProposals(UUID groupId) {
        List<RestaurantProposal> pendingProposals =
                restaurantProposalRepository.findAllByGroupIdAndStatus(
                        groupId,
                        RestaurantProposalStatus.PENDING
                );

        pendingProposals.forEach(RestaurantProposal::cancel);

        if (!pendingProposals.isEmpty()) {
            restaurantProposalRepository.saveAll(pendingProposals);
            restaurantProposalRepository.flush();
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

        if (!groupMemberRepository.existsByGroupIdAndUserId(
                groupId,
                userId
        )) {
            throw new GroupAccessDeniedException(groupId);
        }

        return restaurantGroup;
    }

    private GroupMember getMembership(
            UUID groupId,
            UUID userId
    ) {
        return groupMemberRepository
                .findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() ->
                        new GroupAccessDeniedException(groupId)
                );
    }

    private long getFollowerCount(RestaurantGroup group) {
        if (group.getPrivacy() != GroupPrivacy.PUBLIC) {
            return 0;
        }

        return groupFollowerRepository.countByGroupId(group.getId());
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
