package com.pauluna.mesa.group.api;

import java.util.List;

import com.pauluna.mesa.restaurant.api.GroupRestaurantResponse;

public record PublicGroupDetailResponse(
        PublicGroupSummaryResponse group,
        List<GroupRestaurantResponse> restaurants
) {
}
