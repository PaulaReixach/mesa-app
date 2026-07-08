package com.pauluna.mesa.restaurant.application;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.application.GroupService;
import com.pauluna.mesa.restaurant.api.CreateGroupRestaurantRequest;
import com.pauluna.mesa.restaurant.api.GroupRestaurantResponse;
import com.pauluna.mesa.restaurant.api.UpdateGroupRestaurantRequest;
import com.pauluna.mesa.restaurant.api.UpdateGroupRestaurantStatusRequest;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;
import com.pauluna.mesa.restaurant.domain.Restaurant;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRepository;

@Service
@Transactional
public class RestaurantService {

    private final GroupService groupService;
    private final RestaurantRepository restaurantRepository;
    private final GroupRestaurantRepository groupRestaurantRepository;

    public RestaurantService(
            GroupService groupService,
            RestaurantRepository restaurantRepository,
            GroupRestaurantRepository groupRestaurantRepository
    ) {
        this.groupService = groupService;
        this.restaurantRepository = restaurantRepository;
        this.groupRestaurantRepository = groupRestaurantRepository;
    }

    public GroupRestaurantResponse addRestaurant(
            UUID groupId,
            CreateGroupRestaurantRequest request,
            UUID userId
    ) {
        groupService.validateRestaurantManagementAccess(groupId, userId);

        String provider =
                normalizeOptionalValue(request.provider());

        String externalPlaceId =
                normalizeOptionalValue(request.externalPlaceId());

        String name = request.name().trim();

        String address =
                normalizeOptionalValue(request.address());

        String city =
                normalizeOptionalValue(request.city());

        String country =
                normalizeOptionalValue(request.country());

        String category =
                normalizeOptionalValue(request.category());

        String groupNotes =
                normalizeOptionalValue(request.groupNotes());

        validateExternalReference(
                provider,
                externalPlaceId
        );

        validateCoordinates(
                request.latitude(),
                request.longitude()
        );

        Restaurant restaurant;

        if (provider != null) {
            restaurant = findOrCreateExternalRestaurant(
                    provider,
                    externalPlaceId,
                    name,
                    address,
                    city,
                    country,
                    request,
                    category
            );
        } else {
            validateManualRestaurantIsNotDuplicated(
                    groupId,
                    name,
                    address,
                    city
            );

            restaurant = createRestaurant(
                    null,
                    null,
                    name,
                    address,
                    city,
                    country,
                    request,
                    category
            );
        }

        if (groupRestaurantRepository
                .existsByGroupIdAndRestaurantId(
                        groupId,
                        restaurant.getId()
                )) {
            throw new RestaurantAlreadyInGroupException(groupId);
        }

        GroupRestaurant groupRestaurant = new GroupRestaurant(
                groupId,
                restaurant.getId(),
                GroupRestaurantStatus.WANT_TO_GO,
                userId,
                groupNotes
        );

        GroupRestaurant savedGroupRestaurant =
                groupRestaurantRepository.save(groupRestaurant);

        return GroupRestaurantResponse.from(
                savedGroupRestaurant,
                restaurant
        );
    }

    @Transactional(readOnly = true)
    public List<GroupRestaurantResponse> getRestaurants(
            UUID groupId,
            UUID userId
    ) {
        groupService.validateMemberAccess(groupId, userId);

        List<GroupRestaurant> groupRestaurants =
                groupRestaurantRepository
                        .findAllByGroupIdOrderByCreatedAtDesc(
                                groupId
                        );

        if (groupRestaurants.isEmpty()) {
            return List.of();
        }

        Set<UUID> restaurantIds = groupRestaurants
                .stream()
                .map(GroupRestaurant::getRestaurantId)
                .collect(Collectors.toSet());

        Map<UUID, Restaurant> restaurantsById =
                restaurantRepository
                        .findAllById(restaurantIds)
                        .stream()
                        .collect(Collectors.toMap(
                                Restaurant::getId,
                                Function.identity()
                        ));

        return groupRestaurants
                .stream()
                .map(groupRestaurant ->
                        GroupRestaurantResponse.from(
                                groupRestaurant,
                                getRestaurantFromMap(
                                        restaurantsById,
                                        groupRestaurant.getRestaurantId()
                                )
                        )
                )
                .toList();
    }

    @Transactional(readOnly = true)
    public GroupRestaurantResponse getRestaurant(
            UUID groupId,
            UUID groupRestaurantId,
            UUID userId
    ) {
        groupService.validateMemberAccess(groupId, userId);

        GroupRestaurant groupRestaurant =
                findGroupRestaurant(
                        groupId,
                        groupRestaurantId
                );

        Restaurant restaurant =
                findRestaurant(
                        groupRestaurant.getRestaurantId()
                );

        return GroupRestaurantResponse.from(
                groupRestaurant,
                restaurant
        );
    }

    public GroupRestaurantResponse updateRestaurant(
            UUID groupId,
            UUID groupRestaurantId,
            UpdateGroupRestaurantRequest request,
            UUID userId
    ) {
        groupService.validateRestaurantManagementAccess(groupId, userId);

        GroupRestaurant groupRestaurant =
                findGroupRestaurant(
                        groupId,
                        groupRestaurantId
                );

        Restaurant currentRestaurant =
                findRestaurant(
                        groupRestaurant.getRestaurantId()
                );

        String name = request.name().trim();
        String address =
                normalizeOptionalValue(request.address());
        String city =
                normalizeOptionalValue(request.city());
        String country =
                normalizeOptionalValue(request.country());
        String category =
                normalizeOptionalValue(request.category());
        String groupNotes =
                normalizeOptionalValue(request.groupNotes());

        Restaurant updatedRestaurant;

        if (currentRestaurant.getProvider() != null) {
            updatedRestaurant = restaurantRepository.save(
                    new Restaurant(
                            null,
                            null,
                            name,
                            address,
                            city,
                            country,
                            currentRestaurant.getLatitude(),
                            currentRestaurant.getLongitude(),
                            category
                    )
            );

            groupRestaurant.changeRestaurantId(
                    updatedRestaurant.getId()
            );
        } else {
            currentRestaurant.updateDetails(
                    name,
                    address,
                    city,
                    country,
                    category
            );

            updatedRestaurant =
                    restaurantRepository.saveAndFlush(
                            currentRestaurant
                    );
        }

        groupRestaurant.updateGroupNotes(groupNotes);

        GroupRestaurant updatedGroupRestaurant =
                groupRestaurantRepository.saveAndFlush(
                        groupRestaurant
                );

        return GroupRestaurantResponse.from(
                updatedGroupRestaurant,
                updatedRestaurant
        );
    }

    public GroupRestaurantResponse updateStatus(
            UUID groupId,
            UUID groupRestaurantId,
            UpdateGroupRestaurantStatusRequest request,
            UUID userId
    ) {
        groupService.validateRestaurantManagementAccess(groupId, userId);

        GroupRestaurant groupRestaurant =
                findGroupRestaurant(
                        groupId,
                        groupRestaurantId
                );

        Restaurant restaurant =
                findRestaurant(
                        groupRestaurant.getRestaurantId()
                );

        if (groupRestaurant.getStatus() == request.status()) {
            return GroupRestaurantResponse.from(
                    groupRestaurant,
                    restaurant
            );
        }

        groupRestaurant.changeStatus(request.status());

        GroupRestaurant updatedGroupRestaurant =
                groupRestaurantRepository.saveAndFlush(
                        groupRestaurant
                );

        return GroupRestaurantResponse.from(
                updatedGroupRestaurant,
                restaurant
        );
    }

    private GroupRestaurant findGroupRestaurant(
            UUID groupId,
            UUID groupRestaurantId
    ) {
        return groupRestaurantRepository
                .findByIdAndGroupId(
                        groupRestaurantId,
                        groupId
                )
                .orElseThrow(() ->
                        new GroupRestaurantNotFoundException(
                                groupRestaurantId
                        )
                );
    }

    private Restaurant findRestaurant(UUID restaurantId) {
        return restaurantRepository
                .findById(restaurantId)
                .orElseThrow(() ->
                        new RestaurantNotFoundException(
                                restaurantId
                        )
                );
    }

    private Restaurant findOrCreateExternalRestaurant(
            String provider,
            String externalPlaceId,
            String name,
            String address,
            String city,
            String country,
            CreateGroupRestaurantRequest request,
            String category
    ) {
        return restaurantRepository
                .findByProviderIgnoreCaseAndExternalPlaceId(
                        provider,
                        externalPlaceId
                )
                .orElseGet(() ->
                        createRestaurant(
                                provider,
                                externalPlaceId,
                                name,
                                address,
                                city,
                                country,
                                request,
                                category
                        )
                );
    }

    private Restaurant createRestaurant(
            String provider,
            String externalPlaceId,
            String name,
            String address,
            String city,
            String country,
            CreateGroupRestaurantRequest request,
            String category
    ) {
        Restaurant restaurant = new Restaurant(
                provider,
                externalPlaceId,
                name,
                address,
                city,
                country,
                request.latitude(),
                request.longitude(),
                category
        );

        return restaurantRepository.save(restaurant);
    }

    private void validateManualRestaurantIsNotDuplicated(
            UUID groupId,
            String name,
            String address,
            String city
    ) {
        long equivalentRestaurants =
                groupRestaurantRepository
                        .countEquivalentManualRestaurantInGroup(
                                groupId,
                                name,
                                address,
                                city
                        );

        if (equivalentRestaurants > 0) {
            throw new RestaurantAlreadyInGroupException(groupId);
        }
    }

    private void validateExternalReference(
            String provider,
            String externalPlaceId
    ) {
        boolean hasProvider = provider != null;
        boolean hasExternalPlaceId = externalPlaceId != null;

        if (hasProvider != hasExternalPlaceId) {
            throw new InvalidRestaurantDataException(
                    "El proveedor y el identificador externo deben enviarse juntos."
            );
        }
    }

    private void validateCoordinates(
            Object latitude,
            Object longitude
    ) {
        boolean hasLatitude = latitude != null;
        boolean hasLongitude = longitude != null;

        if (hasLatitude != hasLongitude) {
            throw new InvalidRestaurantDataException(
                    "La latitud y la longitud deben enviarse juntas."
            );
        }
    }

    private Restaurant getRestaurantFromMap(
            Map<UUID, Restaurant> restaurantsById,
            UUID restaurantId
    ) {
        Restaurant restaurant =
                restaurantsById.get(restaurantId);

        if (restaurant == null) {
            throw new RestaurantNotFoundException(restaurantId);
        }

        return restaurant;
    }

    private String normalizeOptionalValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
