package com.pauluna.mesa.group.application;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.api.PublicGroupCollaborationStateResponse;
import com.pauluna.mesa.group.domain.CollaborationRequestStatus;
import com.pauluna.mesa.group.domain.GroupCollaborationRequest;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupCollaborationRequestRepository;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional(readOnly = true)
public class PublicGroupCollaborationStateService {

    private static final long COOLDOWN_DAYS = 30;

    private final RestaurantGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final GroupCollaborationRequestRepository requestRepository;
    private final UserRepository userRepository;

    public PublicGroupCollaborationStateService(
            RestaurantGroupRepository groupRepository,
            GroupMemberRepository memberRepository,
            GroupCollaborationRequestRepository requestRepository,
            UserRepository userRepository
    ) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    public PublicGroupCollaborationStateResponse getState(
            UUID groupId,
            UUID userId
    ) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }

        RestaurantGroup group = groupRepository
                .findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        if (group.getPrivacy() != GroupPrivacy.PUBLIC) {
            throw new GroupNotFoundException(groupId);
        }

        boolean owner = group.getOwnerUserId().equals(userId);
        boolean collaborating = !owner
                && memberRepository.existsByGroupIdAndUserId(
                        groupId,
                        userId
                );

        GroupCollaborationRequest latest = requestRepository
                .findFirstByGroupIdAndUserIdOrderByCreatedAtDesc(
                        groupId,
                        userId
                )
                .orElse(null);

        CollaborationRequestStatus status = latest == null
                ? null
                : latest.getStatus();

        if (!collaborating && status == CollaborationRequestStatus.ACCEPTED) {
            status = null;
        }

        Instant retryAt = latest != null
                && latest.getStatus() == CollaborationRequestStatus.REJECTED
                ? latest.getUpdatedAt().plus(COOLDOWN_DAYS, ChronoUnit.DAYS)
                : null;

        long pendingCount = owner
                ? requestRepository.countByGroupIdAndStatus(
                        groupId,
                        CollaborationRequestStatus.PENDING
                )
                : 0;

        return new PublicGroupCollaborationStateResponse(
                group.isAcceptingCollaborators(),
                collaborating,
                status,
                retryAt,
                pendingCount
        );
    }
}
