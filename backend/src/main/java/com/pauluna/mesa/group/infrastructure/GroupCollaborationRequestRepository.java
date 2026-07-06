package com.pauluna.mesa.group.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.group.domain.CollaborationRequestStatus;
import com.pauluna.mesa.group.domain.GroupCollaborationRequest;

public interface GroupCollaborationRequestRepository
        extends JpaRepository<GroupCollaborationRequest, UUID> {

    Optional<GroupCollaborationRequest>
    findFirstByGroupIdAndUserIdOrderByCreatedAtDesc(
            UUID groupId,
            UUID userId
    );

    Optional<GroupCollaborationRequest>
    findByGroupIdAndUserIdAndStatus(
            UUID groupId,
            UUID userId,
            CollaborationRequestStatus status
    );

    Optional<GroupCollaborationRequest> findByIdAndGroupId(
            UUID id,
            UUID groupId
    );

    List<GroupCollaborationRequest>
    findAllByGroupIdOrderByCreatedAtDesc(
            UUID groupId
    );

    long countByGroupIdAndStatus(
            UUID groupId,
            CollaborationRequestStatus status
    );
}
