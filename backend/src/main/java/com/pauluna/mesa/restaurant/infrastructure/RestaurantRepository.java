package com.pauluna.mesa.restaurant.infrastructure;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.restaurant.domain.Restaurant;

public interface RestaurantRepository
        extends JpaRepository<Restaurant, UUID> {

    Optional<Restaurant> findByProviderIgnoreCaseAndExternalPlaceId(
            String provider,
            String externalPlaceId
    );
}