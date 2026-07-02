package com.pauluna.mesa.user.api;

public record UserProfileStatsResponse(
        long restaurantsCount,
        long groupsCount,
        long ratingsCount
) {
}