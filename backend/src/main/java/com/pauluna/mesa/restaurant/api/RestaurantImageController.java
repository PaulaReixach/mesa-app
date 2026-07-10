package com.pauluna.mesa.restaurant.api;

import java.time.Duration;
import java.util.UUID;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.restaurant.application.RestaurantImageContent;
import com.pauluna.mesa.restaurant.application.RestaurantImageService;

@RestController
@RequestMapping("/restaurants")
public class RestaurantImageController {

    private final RestaurantImageService restaurantImageService;

    public RestaurantImageController(
            RestaurantImageService restaurantImageService
    ) {
        this.restaurantImageService = restaurantImageService;
    }

    @GetMapping("/{restaurantId}/image")
    public ResponseEntity<byte[]> getImage(
            @PathVariable UUID restaurantId
    ) {
        RestaurantImageContent image =
                restaurantImageService.getImage(restaurantId);

        return ResponseEntity
                .ok()
                .contentType(
                        MediaType.parseMediaType(
                                image.contentType()
                        )
                )
                .cacheControl(
                        CacheControl
                                .maxAge(Duration.ofDays(30))
                                .cachePublic()
                )
                .body(image.imageData());
    }
}
