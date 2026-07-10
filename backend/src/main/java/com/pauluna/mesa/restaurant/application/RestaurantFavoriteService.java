package com.pauluna.mesa.restaurant.application;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.application.GroupService;
import com.pauluna.mesa.restaurant.api.GroupRestaurantResponse;
import com.pauluna.mesa.restaurant.api.UpdateGroupRestaurantFavoriteRequest;
import com.pauluna.mesa.restaurant.application.RestaurantRatingSummaryService.RatingSummary;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.Restaurant;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRepository;

@Service
@Transactional
public class RestaurantFavoriteService {

    private final GroupService groupService;
    private final GroupRestaurantRepository groupRestaurantRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantRatingSummaryService ratingSummaryService;

    public RestaurantFavoriteService(
            GroupService groupService,
            GroupRestaurantRepository groupRestaurantRepository,
            RestaurantRepository restaurantRepository,
            RestaurantRatingSummaryService ratingSummaryService
    ) {
        this.groupService = groupService;
        this.groupRestaurantRepository = groupRestaurantRepository;
        this.restaurantRepository = restaurantRepository;
        this.ratingSummaryService = ratingSummaryService;
    }

    public GroupRestaurantResponse updateFavorite(
            UUID groupId,
            UUID groupRestaurantId,
            UpdateGroupRestaurantFavoriteRequest request,
            UUID userId
    ) {
        groupService.validateRestaurantManagementAccess(groupId, userId);

        GroupRestaurant groupRestaurant = groupRestaurantRepository
                .findByIdAndGroupId(groupRestaurantId, groupId)
                .orElseThrow(() ->
                        new GroupRestaurantNotFoundException(groupRestaurantId)
                );

        Restaurant restaurant = restaurantRepository
                .findById(groupRestaurant.getRestaurantId())
                .orElseThrow(() ->
                        new RestaurantNotFoundException(
                                groupRestaurant.getRestaurantId()
                        )
                );

        if (groupRestaurant.isFavorite() != request.favorite()) {
            groupRestaurant.changeFavorite(request.favorite());
            groupRestaurantRepository.saveAndFlush(groupRestaurant);
        }

        RatingSummary ratingSummary =
                ratingSummaryService.getSummary(groupRestaurantId);

        return GroupRestaurantResponse.from(
                groupRestaurant,
                restaurant,
                ratingSummary.averageScore(),
                ratingSummary.ratingsCount()
        );
    }
}
