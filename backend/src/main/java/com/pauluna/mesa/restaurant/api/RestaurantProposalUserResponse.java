package com.pauluna.mesa.restaurant.api;

import java.util.UUID;

import com.pauluna.mesa.user.domain.User;

public record RestaurantProposalUserResponse(
        UUID id,
        String name,
        String username,
        String avatarUrl
) {

    public static RestaurantProposalUserResponse from(User user) {
        return new RestaurantProposalUserResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getAvatarUrl()
        );
    }
}
