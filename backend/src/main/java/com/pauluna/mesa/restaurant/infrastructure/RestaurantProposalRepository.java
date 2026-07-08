package com.pauluna.mesa.restaurant.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.restaurant.domain.RestaurantProposal;
import com.pauluna.mesa.restaurant.domain.RestaurantProposalStatus;

public interface RestaurantProposalRepository
        extends JpaRepository<RestaurantProposal, UUID> {

    Optional<RestaurantProposal> findByIdAndGroupId(
            UUID id,
            UUID groupId
    );

    List<RestaurantProposal> findAllByGroupIdOrderByCreatedAtDesc(
            UUID groupId
    );

    List<RestaurantProposal> findAllByGroupIdAndStatus(
            UUID groupId,
            RestaurantProposalStatus status
    );

    List<RestaurantProposal>
    findAllByGroupIdAndProposedByUserIdOrderByCreatedAtDesc(
            UUID groupId,
            UUID proposedByUserId
    );

    List<RestaurantProposal>
    findAllByGroupIdAndRestaurantIdentityKeyAndStatus(
            UUID groupId,
            String restaurantIdentityKey,
            RestaurantProposalStatus status
    );

    boolean existsByGroupIdAndProposedByUserIdAndRestaurantIdentityKeyAndStatus(
            UUID groupId,
            UUID proposedByUserId,
            String restaurantIdentityKey,
            RestaurantProposalStatus status
    );

    long countByGroupIdAndStatus(
            UUID groupId,
            RestaurantProposalStatus status
    );

    List<RestaurantProposal>
    findAllByGroupIdAndProposedByUserIdAndStatus(
            UUID groupId,
            UUID proposedByUserId,
            RestaurantProposalStatus status
    );
}
