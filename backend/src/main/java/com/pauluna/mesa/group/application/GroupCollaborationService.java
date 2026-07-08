package com.pauluna.mesa.group.application;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.api.CollaborationRequestResponse;
import com.pauluna.mesa.group.api.CollaborationRequesterResponse;
import com.pauluna.mesa.group.api.CreateCollaborationRequest;
import com.pauluna.mesa.group.domain.CollaborationRequestStatus;
import com.pauluna.mesa.group.domain.GroupCollaborationRequest;
import com.pauluna.mesa.group.domain.GroupMember;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupCollaborationRequestRepository;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.restaurant.application.RestaurantProposalService;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRatingRepository;
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class GroupCollaborationService {

    private static final long REJECTION_COOLDOWN_DAYS = 30;

    private final RestaurantGroupRepository restaurantGroupRepository;
    private final GroupCollaborationRequestRepository requestRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupRestaurantRepository groupRestaurantRepository;
    private final RestaurantRatingRepository restaurantRatingRepository;
    private final RestaurantProposalService restaurantProposalService;
    private final UserRepository userRepository;
    private final GroupService groupService;

    public GroupCollaborationService(
            RestaurantGroupRepository restaurantGroupRepository,
            GroupCollaborationRequestRepository requestRepository,
            GroupMemberRepository groupMemberRepository,
            GroupRestaurantRepository groupRestaurantRepository,
            RestaurantRatingRepository restaurantRatingRepository,
            RestaurantProposalService restaurantProposalService,
            UserRepository userRepository,
            GroupService groupService
    ) {
        this.restaurantGroupRepository = restaurantGroupRepository;
        this.requestRepository = requestRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.groupRestaurantRepository = groupRestaurantRepository;
        this.restaurantRatingRepository = restaurantRatingRepository;
        this.restaurantProposalService = restaurantProposalService;
        this.userRepository = userRepository;
        this.groupService = groupService;
    }

    public CollaborationRequestResponse requestCollaboration(
            UUID groupId,
            CreateCollaborationRequest request,
            UUID userId
    ) {
        validateUserExists(userId);
        RestaurantGroup group = getPublicGroup(groupId);

        if (!group.isAcceptingCollaborators()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este grupo no acepta nuevas solicitudes de colaboración."
            );
        }

        if (groupMemberRepository.existsByGroupIdAndUserId(
                groupId,
                userId
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya formas parte de este grupo."
            );
        }

        requestRepository
                .findByGroupIdAndUserIdAndStatus(
                        groupId,
                        userId,
                        CollaborationRequestStatus.PENDING
                )
                .ifPresent(existing -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Ya tienes una solicitud pendiente."
                    );
                });

        requestRepository
                .findFirstByGroupIdAndUserIdOrderByCreatedAtDesc(
                        groupId,
                        userId
                )
                .filter(previous ->
                        previous.getStatus()
                                == CollaborationRequestStatus.REJECTED
                )
                .map(this::getRetryAt)
                .filter(retryAt -> retryAt.isAfter(Instant.now()))
                .ifPresent(retryAt -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Podrás volver a solicitar colaboración a partir de "
                                    + retryAt + "."
                    );
                });

        GroupCollaborationRequest collaborationRequest =
                requestRepository.save(
                        new GroupCollaborationRequest(
                                groupId,
                                userId,
                                normalizeMessage(request.message())
                        )
                );

        return toResponse(collaborationRequest);
    }

    public CollaborationRequestResponse cancelRequest(
            UUID groupId,
            UUID userId
    ) {
        getPublicGroup(groupId);

        GroupCollaborationRequest request = requestRepository
                .findByGroupIdAndUserIdAndStatus(
                        groupId,
                        userId,
                        CollaborationRequestStatus.PENDING
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "No tienes una solicitud pendiente en este grupo."
                        )
                );

        request.cancel();
        return toResponse(requestRepository.saveAndFlush(request));
    }

    public void leaveCollaboration(
            UUID groupId,
            UUID userId
    ) {
        validateUserExists(userId);
        getPublicGroup(groupId);

        GroupMember membership = groupMemberRepository
                .findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "No colaboras en este grupo."
                        )
                );

        if (membership.getRole() != GroupRole.CONTRIBUTOR) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo las personas colaboradoras pueden abandonar la colaboración."
            );
        }

        List<UUID> groupRestaurantIds = groupRestaurantRepository
                .findAllByGroupIdOrderByCreatedAtDesc(groupId)
                .stream()
                .map(GroupRestaurant::getId)
                .toList();

        if (!groupRestaurantIds.isEmpty()) {
            restaurantRatingRepository
                    .deleteAllByGroupRestaurantIdInAndUserId(
                            groupRestaurantIds,
                            userId
                    );
        }

        restaurantProposalService.cancelPendingForCollaborator(
                groupId,
                userId
        );

        groupMemberRepository.deleteByGroupIdAndUserId(groupId, userId);

        requestRepository
                .findFirstByGroupIdAndUserIdOrderByCreatedAtDesc(
                        groupId,
                        userId
                )
                .filter(request ->
                        request.getStatus()
                                == CollaborationRequestStatus.ACCEPTED
                )
                .ifPresent(request -> {
                    request.leave();
                    requestRepository.saveAndFlush(request);
                });
    }

    @Transactional(readOnly = true)
    public List<CollaborationRequestResponse> getRequests(
            UUID groupId,
            UUID ownerUserId
    ) {
        groupService.validateOwnerAccess(groupId, ownerUserId);

        return requestRepository
                .findAllByGroupIdOrderByCreatedAtDesc(groupId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CollaborationRequestResponse acceptRequest(
            UUID groupId,
            UUID requestId,
            UUID ownerUserId
    ) {
        groupService.validateOwnerAccess(groupId, ownerUserId);

        GroupCollaborationRequest request =
                getPendingRequest(groupId, requestId);

        if (!groupMemberRepository.existsByGroupIdAndUserId(
                groupId,
                request.getUserId()
        )) {
            groupMemberRepository.save(
                    new GroupMember(
                            groupId,
                            request.getUserId(),
                            GroupRole.CONTRIBUTOR
                    )
            );
        }

        request.accept();
        return toResponse(requestRepository.saveAndFlush(request));
    }

    public CollaborationRequestResponse rejectRequest(
            UUID groupId,
            UUID requestId,
            UUID ownerUserId
    ) {
        groupService.validateOwnerAccess(groupId, ownerUserId);

        GroupCollaborationRequest request =
                getPendingRequest(groupId, requestId);

        request.reject();
        return toResponse(requestRepository.saveAndFlush(request));
    }

    private GroupCollaborationRequest getPendingRequest(
            UUID groupId,
            UUID requestId
    ) {
        GroupCollaborationRequest request = requestRepository
                .findByIdAndGroupId(requestId, groupId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "No se ha encontrado la solicitud."
                        )
                );

        if (request.getStatus() != CollaborationRequestStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La solicitud ya ha sido resuelta."
            );
        }

        return request;
    }

    private RestaurantGroup getPublicGroup(UUID groupId) {
        RestaurantGroup group = restaurantGroupRepository
                .findById(groupId)
                .orElseThrow(() ->
                        new GroupNotFoundException(groupId)
                );

        if (group.getPrivacy() != GroupPrivacy.PUBLIC) {
            throw new GroupNotFoundException(groupId);
        }

        return group;
    }

    private CollaborationRequestResponse toResponse(
            GroupCollaborationRequest request
    ) {
        User requester = userRepository
                .findById(request.getUserId())
                .orElseThrow(() ->
                        new UserNotFoundException(request.getUserId())
                );

        Instant retryAt = request.getStatus()
                == CollaborationRequestStatus.REJECTED
                ? getRetryAt(request)
                : null;

        return CollaborationRequestResponse.from(
                request,
                CollaborationRequesterResponse.from(requester),
                retryAt
        );
    }

    private Instant getRetryAt(GroupCollaborationRequest request) {
        return request.getUpdatedAt().plus(
                REJECTION_COOLDOWN_DAYS,
                ChronoUnit.DAYS
        );
    }

    private String normalizeMessage(String message) {
        if (message == null || message.isBlank()) {
            return null;
        }

        return message.trim();
    }

    private void validateUserExists(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }
    }
}
