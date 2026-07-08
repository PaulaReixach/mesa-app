package com.pauluna.mesa.restaurant.api;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.restaurant.domain.RestaurantProposal;
import com.pauluna.mesa.restaurant.domain.RestaurantProposalStatus;

public record RestaurantProposalResponse(
        UUID id,
        UUID groupId,
        RestaurantProposalUserResponse proposedBy,
        String provider,
        String externalPlaceId,
        String name,
        String address,
        String city,
        String country,
        BigDecimal latitude,
        BigDecimal longitude,
        String category,
        String message,
        RestaurantProposalStatus status,
        UUID createdGroupRestaurantId,
        Instant createdAt,
        Instant updatedAt
) {

    public static RestaurantProposalResponse from(
            RestaurantProposal proposal,
            RestaurantProposalUserResponse proposedBy
    ) {
        return new RestaurantProposalResponse(
                proposal.getId(),
                proposal.getGroupId(),
                proposedBy,
                proposal.getProvider(),
                proposal.getExternalPlaceId(),
                proposal.getName(),
                proposal.getAddress(),
                proposal.getCity(),
                proposal.getCountry(),
                proposal.getLatitude(),
                proposal.getLongitude(),
                proposal.getCategory(),
                proposal.getMessage(),
                proposal.getStatus(),
                proposal.getCreatedGroupRestaurantId(),
                proposal.getCreatedAt(),
                proposal.getUpdatedAt()
        );
    }
}
