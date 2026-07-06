package com.pauluna.mesa.group.application;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.api.PublicGroupDetailResponse;
import com.pauluna.mesa.group.api.PublicGroupOwnerResponse;
import com.pauluna.mesa.group.api.PublicGroupSummaryResponse;
import com.pauluna.mesa.group.domain.GroupFollower;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupFollowerRepository;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.restaurant.api.GroupRestaurantResponse;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.Restaurant;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRepository;
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class PublicGroupService {

    private final RestaurantGroupRepository restaurantGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupFollowerRepository groupFollowerRepository;
    private final GroupRestaurantRepository groupRestaurantRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public PublicGroupService(
            RestaurantGroupRepository restaurantGroupRepository,
            GroupMemberRepository groupMemberRepository,
            GroupFollowerRepository groupFollowerRepository,
            GroupRestaurantRepository groupRestaurantRepository,
            RestaurantRepository restaurantRepository,
            UserRepository userRepository
    ) {
        this.restaurantGroupRepository = restaurantGroupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.groupFollowerRepository = groupFollowerRepository;
        this.groupRestaurantRepository = groupRestaurantRepository;
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<PublicGroupSummaryResponse> getPublicGroups(
            String city,
            String query,
            UUID userId
    ) {
        validateUserExists(userId);

        String normalizedCity = normalizeFilter(city);
        String normalizedQuery = normalizeFilter(query);

        return restaurantGroupRepository
                .findAllByPrivacyOrderByUpdatedAtDesc(
                        GroupPrivacy.PUBLIC
                )
                .stream()
                .filter(group ->
                        !groupMemberRepository
                                .existsByGroupIdAndUserId(
                                        group.getId(),
                                        userId
                                )
                )
                .filter(group ->
                        matchesCity(
                                group,
                                normalizedCity
                        )
                )
                .filter(group ->
                        matchesQuery(
                                group,
                                normalizedQuery
                        )
                )
                .map(group ->
                        toSummary(group, userId)
                )
                .toList();
    }

    @Transactional(readOnly = true)
    public PublicGroupDetailResponse getPublicGroup(
            UUID groupId,
            UUID userId
    ) {
        validateUserExists(userId);

        RestaurantGroup group = getPublicGroup(groupId);

        return new PublicGroupDetailResponse(
                toSummary(group, userId),
                getPublicRestaurants(groupId)
        );
    }

    public PublicGroupSummaryResponse followGroup(
            UUID groupId,
            UUID userId
    ) {
        validateUserExists(userId);

        RestaurantGroup group = getPublicGroup(groupId);

        if (!group.getOwnerUserId().equals(userId)
                && !groupFollowerRepository
                        .existsByGroupIdAndUserId(
                                groupId,
                                userId
                        )) {
            groupFollowerRepository.save(
                    new GroupFollower(
                            groupId,
                            userId
                    )
            );
        }

        return toSummary(group, userId);
    }

    public PublicGroupSummaryResponse unfollowGroup(
            UUID groupId,
            UUID userId
    ) {
        validateUserExists(userId);

        RestaurantGroup group = getPublicGroup(groupId);

        groupFollowerRepository
                .deleteByGroupIdAndUserId(
                        groupId,
                        userId
                );

        return toSummary(group, userId);
    }

    private RestaurantGroup getPublicGroup(UUID groupId) {
        RestaurantGroup group = restaurantGroupRepository
                .findById(groupId)
                .orElseThrow(() ->
                        new GroupNotFoundException(groupId)
                );

        if (group.getPrivacy() != GroupPrivacy.PUBLIC) {
            throw new GroupNotFoundException(groupId);
        }

        return group;
    }

    private PublicGroupSummaryResponse toSummary(
            RestaurantGroup group,
            UUID userId
    ) {
        User owner = userRepository
                .findById(group.getOwnerUserId())
                .orElseThrow(() ->
                        new UserNotFoundException(
                                group.getOwnerUserId()
                        )
                );

        long memberCount = groupMemberRepository
                .countByGroupId(group.getId());

        return new PublicGroupSummaryResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getImageUrl(),
                group.getCity(),
                PublicGroupOwnerResponse.from(owner),
                groupRestaurantRepository
                        .countByGroupId(group.getId()),
                Math.max(0, memberCount - 1),
                groupFollowerRepository
                        .countByGroupId(group.getId()),
                groupFollowerRepository
                        .existsByGroupIdAndUserId(
                                group.getId(),
                                userId
                        ),
                group.getOwnerUserId().equals(userId),
                group.getUpdatedAt()
        );
    }

    private List<GroupRestaurantResponse> getPublicRestaurants(
            UUID groupId
    ) {
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
                                        groupRestaurant
                                                .getRestaurantId()
                                )
                        )
                )
                .toList();
    }

    private Restaurant getRestaurantFromMap(
            Map<UUID, Restaurant> restaurantsById,
            UUID restaurantId
    ) {
        Restaurant restaurant =
                restaurantsById.get(restaurantId);

        if (restaurant == null) {
            throw new IllegalStateException(
                    "No existe el restaurante asociado "
                            + restaurantId
            );
        }

        return restaurant;
    }

    private boolean matchesCity(
            RestaurantGroup group,
            String city
    ) {
        if (city == null) {
            return true;
        }

        return group.getCity() != null
                && group.getCity()
                        .toLowerCase(Locale.ROOT)
                        .contains(city);
    }

    private boolean matchesQuery(
            RestaurantGroup group,
            String query
    ) {
        if (query == null) {
            return true;
        }

        return contains(group.getName(), query)
                || contains(group.getDescription(), query)
                || contains(group.getCity(), query);
    }

    private boolean contains(
            String value,
            String query
    ) {
        return value != null
                && value
                        .toLowerCase(Locale.ROOT)
                        .contains(query);
    }

    private String normalizeFilter(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private void validateUserExists(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }
    }
}
