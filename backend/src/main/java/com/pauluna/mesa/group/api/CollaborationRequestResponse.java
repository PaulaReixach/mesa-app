package com.pauluna.mesa.group.api;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.group.domain.CollaborationRequestStatus;
import com.pauluna.mesa.group.domain.GroupCollaborationRequest;

public record CollaborationRequestResponse(
        UUID id,
        UUID groupId,
        CollaborationRequesterResponse requester,
        String message,
        CollaborationRequestStatus status,
        Instant createdAt,
        Instant updatedAt,
        Instant retryAt
) {

    public static CollaborationRequestResponse from(
            GroupCollaborationRequest request,
            CollaborationRequesterResponse requester,
            Instant retryAt
    ) {
        return new CollaborationRequestResponse(
                request.getId(),
                request.getGroupId(),
                requester,
                request.getMessage(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getUpdatedAt(),
                retryAt
        );
    }
}
