package com.pauluna.mesa.restaurant.api;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.notification.application.NotificationService;
import com.pauluna.mesa.restaurant.application.RestaurantRatingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(
        "/groups/{groupId}/restaurants/"
                + "{groupRestaurantId}/ratings"
)
public class RestaurantRatingController {

    private final RestaurantRatingService
            restaurantRatingService;

    private final NotificationService
            notificationService;

    public RestaurantRatingController(
            RestaurantRatingService restaurantRatingService,
            NotificationService notificationService
    ) {
        this.restaurantRatingService =
                restaurantRatingService;

        this.notificationService =
                notificationService;
    }

    @GetMapping
    public ResponseEntity<RestaurantRatingsResponse>
    getRatings(
            @PathVariable UUID groupId,
            @PathVariable UUID groupRestaurantId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                restaurantRatingService.getRatings(
                        groupId,
                        groupRestaurantId,
                        userId
                )
        );
    }

    @PutMapping("/me")
    public ResponseEntity<RestaurantRatingsResponse>
    saveMyRating(
            @PathVariable UUID groupId,
            @PathVariable UUID groupRestaurantId,

            @Valid
            @RequestBody
            UpdateRestaurantRatingRequest request,

            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        RestaurantRatingsResponse response =
                restaurantRatingService.saveRating(
                        groupId,
                        groupRestaurantId,
                        request,
                        userId
                );

        notificationService
                .notifyRestaurantRated(
                        groupId,
                        groupRestaurantId,
                        request.score(),
                        userId
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me")
    public ResponseEntity<RestaurantRatingsResponse>
    deleteMyRating(
            @PathVariable UUID groupId,
            @PathVariable UUID groupRestaurantId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                restaurantRatingService.deleteRating(
                        groupId,
                        groupRestaurantId,
                        userId
                )
        );
    }
}