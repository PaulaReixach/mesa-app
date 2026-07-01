package com.pauluna.mesa.restaurant.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.restaurant.application.RestaurantSearchService;

@RestController
@RequestMapping("/restaurants/search")
public class RestaurantSearchController {

    private final RestaurantSearchService restaurantSearchService;

    public RestaurantSearchController(
            RestaurantSearchService restaurantSearchService
    ) {
        this.restaurantSearchService =
                restaurantSearchService;
    }

    @GetMapping
    public ResponseEntity<List<RestaurantSearchResponse>>
    searchRestaurants(
            @RequestParam String query,
            @RequestParam(required = false) String city
    ) {
        return ResponseEntity.ok(
                restaurantSearchService.search(
                        query,
                        city
                )
        );
    }
}