package com.pauluna.mesa.restaurant.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.restaurant.domain.RestaurantRating;

public interface RestaurantRatingRepository
        extends JpaRepository<RestaurantRating, UUID> {

    List<RestaurantRating>
    findAllByGroupRestaurantIdOrderByUpdatedAtDesc(
            UUID groupRestaurantId
    );

    Optional<RestaurantRating>
    findByGroupRestaurantIdAndUserId(
            UUID groupRestaurantId,
            UUID userId
    );

    long countByUserId(
            UUID userId
    );

    long deleteAllByUserId(
            UUID userId
    );
}