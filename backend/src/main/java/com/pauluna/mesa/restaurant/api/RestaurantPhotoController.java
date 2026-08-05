package com.pauluna.mesa.restaurant.api;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pauluna.mesa.restaurant.application.RestaurantPhotoContent;
import com.pauluna.mesa.restaurant.application.RestaurantPhotoService;

@RestController
@RequestMapping(
        "/groups/{groupId}/restaurants/{groupRestaurantId}/photos"
)
public class RestaurantPhotoController {

    private final RestaurantPhotoService restaurantPhotoService;

    public RestaurantPhotoController(
            RestaurantPhotoService restaurantPhotoService
    ) {
        this.restaurantPhotoService = restaurantPhotoService;
    }

    @GetMapping
    public ResponseEntity<List<RestaurantPhotoResponse>> getPhotos(
            @PathVariable UUID groupId,
            @PathVariable UUID groupRestaurantId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                restaurantPhotoService.getPhotos(
                        groupId,
                        groupRestaurantId,
                        userId(jwt)
                )
        );
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RestaurantPhotoResponse> addPhoto(
            @PathVariable UUID groupId,
            @PathVariable UUID groupRestaurantId,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        restaurantPhotoService.savePhoto(
                                groupId,
                                groupRestaurantId,
                                userId(jwt),
                                file
                        )
                );
    }

    @GetMapping("/{photoId}/content")
    public ResponseEntity<byte[]> getPhotoContent(
            @PathVariable UUID groupId,
            @PathVariable UUID groupRestaurantId,
            @PathVariable UUID photoId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        RestaurantPhotoContent photo =
                restaurantPhotoService.getPhotoContent(
                        groupId,
                        groupRestaurantId,
                        photoId,
                        userId(jwt)
                );

        return ResponseEntity
                .ok()
                .contentType(MediaType.parseMediaType(photo.contentType()))
                .cacheControl(
                        CacheControl
                                .maxAge(Duration.ofDays(30))
                                .cachePrivate()
                )
                .body(photo.imageData());
    }

    @DeleteMapping("/{photoId}")
    public ResponseEntity<Void> deletePhoto(
            @PathVariable UUID groupId,
            @PathVariable UUID groupRestaurantId,
            @PathVariable UUID photoId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        restaurantPhotoService.deletePhoto(
                groupId,
                groupRestaurantId,
                photoId,
                userId(jwt)
        );

        return ResponseEntity.noContent().build();
    }

    private UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
