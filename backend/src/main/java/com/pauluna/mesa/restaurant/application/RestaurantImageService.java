package com.pauluna.mesa.restaurant.application;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.application.GroupService;
import com.pauluna.mesa.restaurant.api.GroupRestaurantResponse;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.Restaurant;
import com.pauluna.mesa.restaurant.domain.RestaurantImage;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantImageRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRepository;

@Service
@Transactional
public class RestaurantImageService {

    private static final long MAXIMUM_FILE_SIZE =
            5L * 1024L * 1024L;

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/heic",
                    "image/heif"
            );

    private final GroupService groupService;
    private final GroupRestaurantRepository groupRestaurantRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantImageRepository restaurantImageRepository;

    public RestaurantImageService(
            GroupService groupService,
            GroupRestaurantRepository groupRestaurantRepository,
            RestaurantRepository restaurantRepository,
            RestaurantImageRepository restaurantImageRepository
    ) {
        this.groupService = groupService;
        this.groupRestaurantRepository = groupRestaurantRepository;
        this.restaurantRepository = restaurantRepository;
        this.restaurantImageRepository = restaurantImageRepository;
    }

    public GroupRestaurantResponse saveImage(
            UUID groupId,
            UUID groupRestaurantId,
            UUID requesterUserId,
            MultipartFile file
    ) {
        groupService.validateRestaurantManagementAccess(
                groupId,
                requesterUserId
        );

        validateFile(file);

        GroupRestaurant groupRestaurant = findGroupRestaurant(
                groupId,
                groupRestaurantId
        );
        Restaurant restaurant = findRestaurant(
                groupRestaurant.getRestaurantId()
        );

        String contentType = file.getContentType()
                .trim()
                .toLowerCase(Locale.ROOT);

        byte[] imageData;

        try {
            imageData = file.getBytes();
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se ha podido leer la imagen.",
                    exception
            );
        }

        RestaurantImage restaurantImage =
                restaurantImageRepository
                        .findById(restaurant.getId())
                        .orElseGet(() -> new RestaurantImage(
                                restaurant.getId(),
                                contentType,
                                imageData
                        ));

        restaurantImage.update(contentType, imageData);
        restaurantImageRepository.save(restaurantImage);

        String imageUrl =
                "/restaurants/"
                        + restaurant.getId()
                        + "/image?v="
                        + UUID.randomUUID();

        restaurant.updateImageUrl(imageUrl);
        Restaurant updatedRestaurant =
                restaurantRepository.saveAndFlush(restaurant);

        return GroupRestaurantResponse.from(
                groupRestaurant,
                updatedRestaurant
        );
    }

    public GroupRestaurantResponse deleteImage(
            UUID groupId,
            UUID groupRestaurantId,
            UUID requesterUserId
    ) {
        groupService.validateRestaurantManagementAccess(
                groupId,
                requesterUserId
        );

        GroupRestaurant groupRestaurant = findGroupRestaurant(
                groupId,
                groupRestaurantId
        );
        Restaurant restaurant = findRestaurant(
                groupRestaurant.getRestaurantId()
        );

        restaurantImageRepository
                .findById(restaurant.getId())
                .ifPresent(restaurantImageRepository::delete);

        restaurant.updateImageUrl(null);
        Restaurant updatedRestaurant =
                restaurantRepository.saveAndFlush(restaurant);

        return GroupRestaurantResponse.from(
                groupRestaurant,
                updatedRestaurant
        );
    }

    @Transactional(readOnly = true)
    public RestaurantImageContent getImage(UUID restaurantId) {
        RestaurantImage image = restaurantImageRepository
                .findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El restaurante no tiene imagen."
                ));

        return new RestaurantImageContent(
                image.getContentType(),
                image.getImageData()
        );
    }

    private GroupRestaurant findGroupRestaurant(
            UUID groupId,
            UUID groupRestaurantId
    ) {
        return groupRestaurantRepository
                .findByIdAndGroupId(groupRestaurantId, groupId)
                .orElseThrow(() ->
                        new GroupRestaurantNotFoundException(
                                groupRestaurantId
                        )
                );
    }

    private Restaurant findRestaurant(UUID restaurantId) {
        return restaurantRepository
                .findById(restaurantId)
                .orElseThrow(() ->
                        new RestaurantNotFoundException(restaurantId)
                );
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selecciona una imagen."
            );
        }

        if (file.getSize() > MAXIMUM_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La imagen no puede superar los 5 MB."
            );
        }

        String contentType = file.getContentType();

        if (
                contentType == null
                || !ALLOWED_CONTENT_TYPES.contains(
                        contentType
                                .trim()
                                .toLowerCase(Locale.ROOT)
                )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El archivo debe ser una imagen JPG, PNG, WEBP o HEIC."
            );
        }
    }
}
