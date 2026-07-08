package com.pauluna.mesa.group.api;

import java.time.Instant;

import com.pauluna.mesa.group.domain.CollaborationRequestStatus;

public record PublicGroupCollaborationStateResponse(
        boolean acceptingCollaborators,
        boolean collaborating,
        boolean invitationPending,
        CollaborationRequestStatus requestStatus,
        Instant retryAt,
        long pendingRequestCount
) {
}
