package com.pauluna.mesa.restaurant.api;

import java.math.BigDecimal;
import java.util.UUID;

import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;
import com.pauluna.mesa.restaurant.domain.Restaurant;

public record MapRestaurantResponse(

        UUID groupRestaurantId,
        UUID groupId,
        String groupName,

        GroupRestaurantStatus status,
        boolean favorite,

        UUID restaurantId,
        String name,
        String address,
        String city,
        String country,

        BigDecimal latitude,
        BigDecimal longitude,

        String category,
        String imageUrl

) {

    public static MapRestaurantResponse from(
            GroupRestaurant groupRestaurant,
            Restaurant restaurant,
            RestaurantGroup group
    ) {
        return new MapRestaurantResponse(
                groupRestaurant.getId(),
                groupRestaurant.getGroupId(),
                group.getName(),

                groupRestaurant.getStatus(),
                groupRestaurant.isFavorite(),

                restaurant.getId(),
                restaurant.getName(),
                restaurant.getAddress(),
                restaurant.getCity(),
                restaurant.getCountry(),

                restaurant.getLatitude(),
                restaurant.getLongitude(),

                restaurant.getCategory(),
                restaurant.getImageUrl()
        );
    }
}
