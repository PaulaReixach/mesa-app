package com.pauluna.mesa.restaurant.infrastructure;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.restaurant.domain.RestaurantImage;

public interface RestaurantImageRepository
        extends JpaRepository<RestaurantImage, UUID> {
}
