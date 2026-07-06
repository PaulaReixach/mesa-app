package com.pauluna.mesa.group.api;

import java.util.List;
import java.util.UUID;

public record CopyPublicRestaurantsResponse(
        UUID destinationGroupId,
        int copiedCount,
        int skippedCount,
        List<UUID> copiedGroupRestaurantIds,
        List<UUID> skippedSourceGroupRestaurantIds
) {
}
