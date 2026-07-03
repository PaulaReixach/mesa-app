package com.pauluna.mesa.restaurant.application;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.restaurant.api.MapRestaurantResponse;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.Restaurant;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRepository;

@Service
@Transactional(readOnly = true)
public class MapRestaurantService {

    private final RestaurantGroupRepository
            restaurantGroupRepository;

    private final GroupRestaurantRepository
            groupRestaurantRepository;

    private final RestaurantRepository
            restaurantRepository;

    public MapRestaurantService(
            RestaurantGroupRepository restaurantGroupRepository,
            GroupRestaurantRepository groupRestaurantRepository,
            RestaurantRepository restaurantRepository
    ) {
        this.restaurantGroupRepository =
                restaurantGroupRepository;

        this.groupRestaurantRepository =
                groupRestaurantRepository;

        this.restaurantRepository =
                restaurantRepository;
    }

    public List<MapRestaurantResponse> getMapRestaurants(
            UUID userId
    ) {
        List<RestaurantGroup> groups =
                restaurantGroupRepository
                        .findAllByMemberUserId(userId);

        if (groups.isEmpty()) {
            return List.of();
        }

        Map<UUID, RestaurantGroup> groupsById =
                groups
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        RestaurantGroup::getId,
                                        Function.identity()
                                )
                        );

        List<GroupRestaurant> groupRestaurants =
                groupRestaurantRepository
                        .findAllByGroupIdInOrderByCreatedAtDesc(
                                groupsById.keySet()
                        );

        if (groupRestaurants.isEmpty()) {
            return List.of();
        }

        Set<UUID> restaurantIds =
                groupRestaurants
                        .stream()
                        .map(GroupRestaurant::getRestaurantId)
                        .collect(Collectors.toSet());

        Map<UUID, Restaurant> restaurantsById =
                restaurantRepository
                        .findAllById(restaurantIds)
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        Restaurant::getId,
                                        Function.identity()
                                )
                        );

        return groupRestaurants
                .stream()
                .map(groupRestaurant -> {
                    Restaurant restaurant =
                            getRestaurant(
                                    restaurantsById,
                                    groupRestaurant
                                            .getRestaurantId()
                            );

                    RestaurantGroup group =
                            getGroup(
                                    groupsById,
                                    groupRestaurant
                                            .getGroupId()
                            );

                    return MapRestaurantResponse.from(
                            groupRestaurant,
                            restaurant,
                            group
                    );
                })
                .filter(response ->
                        response.latitude() != null
                                && response.longitude() != null
                )
                .toList();
    }

    private Restaurant getRestaurant(
            Map<UUID, Restaurant> restaurantsById,
            UUID restaurantId
    ) {
        Restaurant restaurant =
                restaurantsById.get(restaurantId);

        if (restaurant == null) {
            throw new IllegalStateException(
                    "No se ha encontrado el restaurante "
                            + restaurantId
            );
        }

        return restaurant;
    }

    private RestaurantGroup getGroup(
            Map<UUID, RestaurantGroup> groupsById,
            UUID groupId
    ) {
        RestaurantGroup group =
                groupsById.get(groupId);

        if (group == null) {
            throw new IllegalStateException(
                    "No se ha encontrado el grupo "
                            + groupId
            );
        }

        return group;
    }
}