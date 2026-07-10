package com.pauluna.mesa.restaurant.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.restaurant.application.RestaurantLocationSearchService;

@RestController
@RequestMapping("/restaurants/geocode")
public class RestaurantLocationController {

    private final RestaurantLocationSearchService locationSearchService;

    public RestaurantLocationController(
            RestaurantLocationSearchService locationSearchService
    ) {
        this.locationSearchService = locationSearchService;
    }

    @GetMapping
    public ResponseEntity<List<RestaurantLocationResponse>>
    searchLocations(
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country
    ) {
        return ResponseEntity.ok(
                locationSearchService.search(
                        address,
                        city,
                        country
                )
        );
    }
}
