package com.pauluna.mesa.group.application;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.api.GroupResponse;
import com.pauluna.mesa.group.domain.GroupImage;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupImageRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;

@Service
@Transactional
public class GroupImageService {

    private static final long MAXIMUM_FILE_SIZE =
            5L * 1024L * 1024L;

    private static final Set<String>
            ALLOWED_CONTENT_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/heic",
                    "image/heif"
            );

    private final GroupService groupService;

    private final RestaurantGroupRepository
            restaurantGroupRepository;

    private final GroupImageRepository
            groupImageRepository;

    public GroupImageService(
            GroupService groupService,
            RestaurantGroupRepository
                    restaurantGroupRepository,
            GroupImageRepository groupImageRepository
    ) {
        this.groupService = groupService;

        this.restaurantGroupRepository =
                restaurantGroupRepository;

        this.groupImageRepository =
                groupImageRepository;
    }

    public GroupResponse saveImage(
            UUID groupId,
            UUID requesterUserId,
            MultipartFile file
    ) {
        groupService.validateOwnerAccess(
                groupId,
                requesterUserId
        );

        validateFile(file);

        RestaurantGroup group =
                findGroup(groupId);

        String contentType =
                file.getContentType()
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

        GroupImage groupImage =
                groupImageRepository
                        .findById(groupId)
                        .orElseGet(() ->
                                new GroupImage(
                                        groupId,
                                        contentType,
                                        imageData
                                )
                        );

        groupImage.update(
                contentType,
                imageData
        );

        groupImageRepository.save(groupImage);

        String imageUrl =
                "/groups/"
                        + groupId
                        + "/image?v="
                        + UUID.randomUUID();

        group.updateImageUrl(imageUrl);

        RestaurantGroup updatedGroup =
                restaurantGroupRepository
                        .saveAndFlush(group);

        return GroupResponse.from(updatedGroup);
    }

    @Transactional(readOnly = true)
    public GroupImageContent getImage(
            UUID groupId
    ) {
        GroupImage groupImage =
                groupImageRepository
                        .findById(groupId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "El grupo no tiene imagen."
                                )
                        );

        return new GroupImageContent(
                groupImage.getContentType(),
                groupImage.getImageData()
        );
    }

    public GroupResponse deleteImage(
            UUID groupId,
            UUID requesterUserId
    ) {
        groupService.validateOwnerAccess(
                groupId,
                requesterUserId
        );

        RestaurantGroup group =
                findGroup(groupId);

        groupImageRepository
                .findById(groupId)
                .ifPresent(
                        groupImageRepository::delete
                );

        group.updateImageUrl(null);

        RestaurantGroup updatedGroup =
                restaurantGroupRepository
                        .saveAndFlush(group);

        return GroupResponse.from(updatedGroup);
    }

    private RestaurantGroup findGroup(
            UUID groupId
    ) {
        return restaurantGroupRepository
                .findById(groupId)
                .orElseThrow(() ->
                        new GroupNotFoundException(
                                groupId
                        )
                );
    }

    private void validateFile(
            MultipartFile file
    ) {
        if (
                file == null
                || file.isEmpty()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selecciona una imagen."
            );
        }

        if (
                file.getSize()
                        > MAXIMUM_FILE_SIZE
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La imagen no puede superar los 5 MB."
            );
        }

        String contentType =
                file.getContentType();

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