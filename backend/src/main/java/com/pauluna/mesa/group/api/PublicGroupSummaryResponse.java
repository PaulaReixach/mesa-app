package com.pauluna.mesa.group.api;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.group.domain.CollaborationRequestStatus;

public record PublicGroupSummaryResponse(
        UUID id,
        String name,
        String description,
        String imageUrl,
        String city,
        PublicGroupOwnerResponse owner,
        long restaurantCount,
        long collaboratorCount,
        long followerCount,
        boolean following,
        boolean ownedByCurrentUser,
        boolean acceptingCollaborators,
        boolean collaborating,
        CollaborationRequestStatus collaborationRequestStatus,
        Instant collaborationRetryAt,
        long pendingCollaborationRequestCount,
        Instant updatedAt
) {
}
