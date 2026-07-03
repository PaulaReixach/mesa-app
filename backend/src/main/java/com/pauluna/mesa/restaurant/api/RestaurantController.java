package com.pauluna.mesa.restaurant.api;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.pauluna.mesa.notification.application.NotificationService;
import com.pauluna.mesa.restaurant.application.RestaurantService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/groups/{groupId}/restaurants")
public class RestaurantController {

    private final RestaurantService
            restaurantService;

    private final NotificationService
            notificationService;

    public RestaurantController(
            RestaurantService restaurantService,
            NotificationService notificationService
    ) {
        this.restaurantService =
                restaurantService;

        this.notificationService =
                notificationService;
    }

    @PostMapping
    public ResponseEntity<GroupRestaurantResponse>
    addRestaurant(
            @PathVariable UUID groupId,

            @Valid
            @RequestBody
            CreateGroupRestaurantRequest request,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        GroupRestaurantResponse createdRestaurant =
                restaurantService.addRestaurant(
                        groupId,
                        request,
                        userId
                );

        notificationService
                .notifyRestaurantAdded(
                        groupId,
                        createdRestaurant.id(),
                        userId
                );

        URI location =
                ServletUriComponentsBuilder
                        .fromCurrentRequest()
                        .path("/{groupRestaurantId}")
                        .buildAndExpand(
                                createdRestaurant.id()
                        )
                        .toUri();

        return ResponseEntity
                .created(location)
                .body(createdRestaurant);
    }

    @GetMapping
    public ResponseEntity<List<GroupRestaurantResponse>>
    getRestaurants(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                restaurantService.getRestaurants(
                        groupId,
                        userId
                )
        );
    }

    @GetMapping("/{groupRestaurantId}")
    public ResponseEntity<GroupRestaurantResponse>
    getRestaurant(
            @PathVariable UUID groupId,
            @PathVariable UUID groupRestaurantId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                restaurantService.getRestaurant(
                        groupId,
                        groupRestaurantId,
                        userId
                )
        );
    }

    @PatchMapping(
            "/{groupRestaurantId}/status"
    )
    public ResponseEntity<GroupRestaurantResponse>
    updateStatus(
            @PathVariable UUID groupId,
            @PathVariable UUID groupRestaurantId,

            @Valid
            @RequestBody
            UpdateGroupRestaurantStatusRequest request,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        GroupRestaurantResponse response =
                restaurantService.updateStatus(
                        groupId,
                        groupRestaurantId,
                        request,
                        userId
                );

        notificationService
                .notifyRestaurantStatusChanged(
                        groupId,
                        groupRestaurantId,
                        request.status(),
                        userId
                );

        return ResponseEntity.ok(response);
    }
}