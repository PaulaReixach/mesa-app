package com.pauluna.mesa.restaurant.api;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.restaurant.application.MapRestaurantService;

@RestController
@RequestMapping("/restaurants/map")
public class MapRestaurantController {

    private final MapRestaurantService
            mapRestaurantService;

    public MapRestaurantController(
            MapRestaurantService mapRestaurantService
    ) {
        this.mapRestaurantService =
                mapRestaurantService;
    }

    @GetMapping
    public ResponseEntity<List<MapRestaurantResponse>>
    getMapRestaurants(
            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                mapRestaurantService
                        .getMapRestaurants(userId)
        );
    }
}