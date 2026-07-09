package com.pauluna.mesa.restaurant.api;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.restaurant.application.RestaurantFavoriteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/groups/{groupId}/restaurants/{groupRestaurantId}/favorite")
public class RestaurantFavoriteController {

    private final RestaurantFavoriteService restaurantFavoriteService;

    public RestaurantFavoriteController(
            RestaurantFavoriteService restaurantFavoriteService
    ) {
        this.restaurantFavoriteService = restaurantFavoriteService;
    }

    @PatchMapping
    public ResponseEntity<GroupRestaurantResponse> updateFavorite(
            @PathVariable UUID groupId,
            @PathVariable UUID groupRestaurantId,
            @Valid @RequestBody UpdateGroupRestaurantFavoriteRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                restaurantFavoriteService.updateFavorite(
                        groupId,
                        groupRestaurantId,
                        request,
                        userId
                )
        );
    }
}
