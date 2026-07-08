package com.pauluna.mesa.group.api;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.group.domain.GroupActivityEvent;
import com.pauluna.mesa.group.domain.GroupActivityType;
import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;

public record GroupActivityResponse(
        Long id,
        GroupActivityType type,
        UUID actorUserId,
        String actorName,
        String actorAvatarUrl,
        UUID subjectUserId,
        String subjectName,
        String subjectAvatarUrl,
        String restaurantName,
        Integer score,
        GroupRestaurantStatus restaurantStatus,
        Instant createdAt
) {

    public static GroupActivityResponse from(GroupActivityEvent event) {
        return new GroupActivityResponse(
                event.getId(),
                event.getType(),
                event.getActorUserId(),
                event.getActorName(),
                event.getActorAvatarUrl(),
                event.getSubjectUserId(),
                event.getSubjectName(),
                event.getSubjectAvatarUrl(),
                event.getRestaurantName(),
                event.getScore(),
                event.getRestaurantStatus(),
                event.getCreatedAt()
        );
    }
}
