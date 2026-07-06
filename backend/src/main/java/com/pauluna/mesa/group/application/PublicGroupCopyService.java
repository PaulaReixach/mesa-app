package com.pauluna.mesa.group.application;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.api.CopyPublicRestaurantsRequest;
import com.pauluna.mesa.group.api.CopyPublicRestaurantsResponse;
import com.pauluna.mesa.group.api.GroupResponse;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.restaurant.application.GroupRestaurantNotFoundException;
import com.pauluna.mesa.restaurant.application.InvalidRestaurantDataException;
import com.pauluna.mesa.restaurant.application.RestaurantNotFoundException;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;
import com.pauluna.mesa.restaurant.domain.Restaurant;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRepository;
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class PublicGroupCopyService {

    private final RestaurantGroupRepository restaurantGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupRestaurantRepository groupRestaurantRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public PublicGroupCopyService(
            RestaurantGroupRepository restaurantGroupRepository,
            GroupMemberRepository groupMemberRepository,
            GroupRestaurantRepository groupRestaurantRepository,
            RestaurantRepository restaurantRepository,
            UserRepository userRepository
    ) {
        this.restaurantGroupRepository = restaurantGroupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.groupRestaurantRepository = groupRestaurantRepository;
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getCopyDestinations(
            UUID sourceGroupId,
            UUID userId
    ) {
        validateUserExists(userId);
        getPublicSourceGroup(sourceGroupId);

        return restaurantGroupRepository
                .findAllByMemberUserId(userId)
                .stream()
                .filter(group ->
                        !group.getId().equals(sourceGroupId)
                )
                .filter(group ->
                        isAllowedDestination(group, userId)
                )
                .map(GroupResponse::from)
                .toList();
    }

    public CopyPublicRestaurantsResponse copyRestaurants(
            UUID sourceGroupId,
            CopyPublicRestaurantsRequest request,
            UUID userId
    ) {
        validateUserExists(userId);
        getPublicSourceGroup(sourceGroupId);

        RestaurantGroup destinationGroup =
                validateDestination(
                        sourceGroupId,
                        request.destinationGroupId(),
                        userId
                );

        LinkedHashSet<UUID> requestedIds =
                new LinkedHashSet<>(
                        request.groupRestaurantIds()
                );

        List<GroupRestaurant> selectedRestaurants =
                groupRestaurantRepository
                        .findAllByIdInAndGroupId(
                                requestedIds,
                                sourceGroupId
                        );

        Map<UUID, GroupRestaurant> selectedById =
                selectedRestaurants
                        .stream()
                        .collect(Collectors.toMap(
                                GroupRestaurant::getId,
                                Function.identity()
                        ));

        for (UUID requestedId : requestedIds) {
            if (!selectedById.containsKey(requestedId)) {
                throw new GroupRestaurantNotFoundException(
                        requestedId
                );
            }
        }

        Set<UUID> restaurantIds = selectedRestaurants
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

        List<UUID> copiedIds = new ArrayList<>();
        List<UUID> skippedSourceIds = new ArrayList<>();

        for (UUID requestedId : requestedIds) {
            GroupRestaurant sourceGroupRestaurant =
                    selectedById.get(requestedId);

            Restaurant sourceRestaurant =
                    getRestaurant(
                            restaurantsById,
                            sourceGroupRestaurant
                                    .getRestaurantId()
                    );

            if (isAlreadyInDestination(
                    destinationGroup.getId(),
                    sourceRestaurant
            )) {
                skippedSourceIds.add(requestedId);
                continue;
            }

            Restaurant destinationRestaurant =
                    getDestinationRestaurant(sourceRestaurant);

            GroupRestaurant copiedGroupRestaurant =
                    new GroupRestaurant(
                            destinationGroup.getId(),
                            destinationRestaurant.getId(),
                            GroupRestaurantStatus.WANT_TO_GO,
                            userId,
                            null,
                            sourceGroupId,
                            sourceGroupRestaurant.getId()
                    );

            GroupRestaurant saved =
                    groupRestaurantRepository.save(
                            copiedGroupRestaurant
                    );

            copiedIds.add(saved.getId());
        }

        return new CopyPublicRestaurantsResponse(
                destinationGroup.getId(),
                copiedIds.size(),
                skippedSourceIds.size(),
                List.copyOf(copiedIds),
                List.copyOf(skippedSourceIds)
        );
    }

    private RestaurantGroup getPublicSourceGroup(
            UUID sourceGroupId
    ) {
        RestaurantGroup sourceGroup =
                restaurantGroupRepository
                        .findById(sourceGroupId)
                        .orElseThrow(() ->
                                new GroupNotFoundException(
                                        sourceGroupId
                                )
                        );

        if (sourceGroup.getPrivacy() != GroupPrivacy.PUBLIC) {
            throw new GroupNotFoundException(sourceGroupId);
        }

        return sourceGroup;
    }

    private RestaurantGroup validateDestination(
            UUID sourceGroupId,
            UUID destinationGroupId,
            UUID userId
    ) {
        if (sourceGroupId.equals(destinationGroupId)) {
            throw new InvalidRestaurantDataException(
                    "El grupo de origen y el de destino deben ser distintos."
            );
        }

        RestaurantGroup destinationGroup =
                restaurantGroupRepository
                        .findById(destinationGroupId)
                        .orElseThrow(() ->
                                new GroupNotFoundException(
                                        destinationGroupId
                                )
                        );

        boolean belongsToDestination =
                groupMemberRepository
                        .existsByGroupIdAndUserId(
                                destinationGroupId,
                                userId
                        );

        if (!belongsToDestination
                || !isAllowedDestination(
                        destinationGroup,
                        userId
                )) {
            throw new GroupAccessDeniedException(
                    destinationGroupId
            );
        }

        return destinationGroup;
    }

    private boolean isAllowedDestination(
            RestaurantGroup group,
            UUID userId
    ) {
        return group.getPrivacy() == GroupPrivacy.PRIVATE
                || group.getOwnerUserId().equals(userId);
    }

    private boolean isAlreadyInDestination(
            UUID destinationGroupId,
            Restaurant restaurant
    ) {
        boolean sameRestaurant =
                groupRestaurantRepository
                        .existsByGroupIdAndRestaurantId(
                                destinationGroupId,
                                restaurant.getId()
                        );

        if (sameRestaurant) {
            return true;
        }

        return groupRestaurantRepository
                .countEquivalentManualRestaurantInGroup(
                        destinationGroupId,
                        restaurant.getName(),
                        restaurant.getAddress(),
                        restaurant.getCity()
                ) > 0;
    }

    private Restaurant getDestinationRestaurant(
            Restaurant sourceRestaurant
    ) {
        if (sourceRestaurant.getProvider() != null) {
            return sourceRestaurant;
        }

        return restaurantRepository.save(
                new Restaurant(
                        null,
                        null,
                        sourceRestaurant.getName(),
                        sourceRestaurant.getAddress(),
                        sourceRestaurant.getCity(),
                        sourceRestaurant.getCountry(),
                        sourceRestaurant.getLatitude(),
                        sourceRestaurant.getLongitude(),
                        sourceRestaurant.getCategory()
                )
        );
    }

    private Restaurant getRestaurant(
            Map<UUID, Restaurant> restaurantsById,
            UUID restaurantId
    ) {
        Restaurant restaurant =
                restaurantsById.get(restaurantId);

        if (restaurant == null) {
            throw new RestaurantNotFoundException(
                    restaurantId
            );
        }

        return restaurant;
    }

    private void validateUserExists(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }
    }
}
