package com.pauluna.mesa.user.application;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRatingRepository;
import com.pauluna.mesa.user.api.UserProfileStatsResponse;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional(readOnly = true)
public class UserProfileStatsService {

    private final UserRepository userRepository;

    private final GroupMemberRepository
            groupMemberRepository;

    private final GroupRestaurantRepository
            groupRestaurantRepository;

    private final RestaurantRatingRepository
            restaurantRatingRepository;

    public UserProfileStatsService(
            UserRepository userRepository,
            GroupMemberRepository groupMemberRepository,
            GroupRestaurantRepository groupRestaurantRepository,
            RestaurantRatingRepository restaurantRatingRepository
    ) {
        this.userRepository = userRepository;
        this.groupMemberRepository =
                groupMemberRepository;
        this.groupRestaurantRepository =
                groupRestaurantRepository;
        this.restaurantRatingRepository =
                restaurantRatingRepository;
    }

    public UserProfileStatsResponse getStats(
            UUID userId
    ) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }

        long restaurantsCount =
                groupRestaurantRepository
                        .countByProposedByUserId(userId);

        long groupsCount =
                groupMemberRepository
                        .countByUserId(userId);

        long ratingsCount =
                restaurantRatingRepository
                        .countByUserId(userId);

        return new UserProfileStatsResponse(
                restaurantsCount,
                groupsCount,
                ratingsCount
        );
    }
}