package com.pauluna.mesa.restaurant.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.application.GroupService;
import com.pauluna.mesa.restaurant.api.RestaurantRatingResponse;
import com.pauluna.mesa.restaurant.api.RestaurantRatingsResponse;
import com.pauluna.mesa.restaurant.api.UpdateRestaurantRatingRequest;
import com.pauluna.mesa.restaurant.domain.RestaurantRating;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRatingRepository;
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class RestaurantRatingService {

    private final GroupService groupService;

    private final GroupRestaurantRepository
            groupRestaurantRepository;

    private final RestaurantRatingRepository
            restaurantRatingRepository;

    private final UserRepository userRepository;

    public RestaurantRatingService(
            GroupService groupService,
            GroupRestaurantRepository groupRestaurantRepository,
            RestaurantRatingRepository restaurantRatingRepository,
            UserRepository userRepository
    ) {
        this.groupService = groupService;
        this.groupRestaurantRepository =
                groupRestaurantRepository;
        this.restaurantRatingRepository =
                restaurantRatingRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public RestaurantRatingsResponse getRatings(
            UUID groupId,
            UUID groupRestaurantId,
            UUID userId
    ) {
        validateAccess(
                groupId,
                groupRestaurantId,
                userId
        );

        return buildRatingsResponse(
                groupRestaurantId,
                userId
        );
    }

    public RestaurantRatingsResponse saveRating(
            UUID groupId,
            UUID groupRestaurantId,
            UpdateRestaurantRatingRequest request,
            UUID userId
    ) {
        validateAccess(
                groupId,
                groupRestaurantId,
                userId
        );

        RestaurantRating rating =
                restaurantRatingRepository
                        .findByGroupRestaurantIdAndUserId(
                                groupRestaurantId,
                                userId
                        )
                        .orElseGet(() ->
                                new RestaurantRating(
                                        groupRestaurantId,
                                        userId,
                                        request.score()
                                )
                        );

        rating.changeScore(request.score());

        restaurantRatingRepository.saveAndFlush(rating);

        return buildRatingsResponse(
                groupRestaurantId,
                userId
        );
    }

    public RestaurantRatingsResponse deleteRating(
            UUID groupId,
            UUID groupRestaurantId,
            UUID userId
    ) {
        validateAccess(
                groupId,
                groupRestaurantId,
                userId
        );

        restaurantRatingRepository
                .findByGroupRestaurantIdAndUserId(
                        groupRestaurantId,
                        userId
                )
                .ifPresent(rating -> {
                    restaurantRatingRepository.delete(rating);
                    restaurantRatingRepository.flush();
                });

        return buildRatingsResponse(
                groupRestaurantId,
                userId
        );
    }

    private void validateAccess(
            UUID groupId,
            UUID groupRestaurantId,
            UUID userId
    ) {
        groupService.validateMemberAccess(
                groupId,
                userId
        );

        groupRestaurantRepository
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

    private RestaurantRatingsResponse buildRatingsResponse(
            UUID groupRestaurantId,
            UUID currentUserId
    ) {
        List<RestaurantRating> ratings =
                restaurantRatingRepository
                        .findAllByGroupRestaurantIdOrderByUpdatedAtDesc(
                                groupRestaurantId
                        );

        if (ratings.isEmpty()) {
            return new RestaurantRatingsResponse(
                    null,
                    0,
                    null,
                    List.of()
            );
        }

        Set<UUID> userIds = ratings
                .stream()
                .map(RestaurantRating::getUserId)
                .collect(Collectors.toSet());

        Map<UUID, User> usersById =
                userRepository
                        .findAllById(userIds)
                        .stream()
                        .collect(Collectors.toMap(
                                User::getId,
                                Function.identity()
                        ));

        Integer currentUserScore = ratings
                .stream()
                .filter(rating ->
                        rating.getUserId()
                                .equals(currentUserId)
                )
                .map(RestaurantRating::getScore)
                .findFirst()
                .orElse(null);

        double average = ratings
                .stream()
                .mapToInt(RestaurantRating::getScore)
                .average()
                .orElse(0);

        BigDecimal averageScore =
                BigDecimal
                        .valueOf(average)
                        .setScale(
                                1,
                                RoundingMode.HALF_UP
                        );

        List<RestaurantRatingResponse> responses =
                ratings
                        .stream()
                        .sorted(
                                Comparator
                                        .comparing(
                                                (
                                                        RestaurantRating rating
                                                ) ->
                                                        !rating
                                                                .getUserId()
                                                                .equals(
                                                                        currentUserId
                                                                )
                                        )
                                        .thenComparing(
                                                RestaurantRating
                                                        ::getUpdatedAt,
                                                Comparator
                                                        .reverseOrder()
                                        )
                        )
                        .map(rating ->
                                RestaurantRatingResponse.from(
                                        rating,
                                        getUser(
                                                usersById,
                                                rating.getUserId()
                                        ),
                                        rating
                                                .getUserId()
                                                .equals(
                                                        currentUserId
                                                )
                                )
                        )
                        .toList();

        return new RestaurantRatingsResponse(
                averageScore,
                ratings.size(),
                currentUserScore,
                responses
        );
    }

    private User getUser(
            Map<UUID, User> usersById,
            UUID userId
    ) {
        User user = usersById.get(userId);

        if (user == null) {
            throw new UserNotFoundException(userId);
        }

        return user;
    }
}