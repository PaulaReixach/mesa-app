package com.pauluna.mesa.restaurant.application;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.application.GroupService;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.restaurant.api.RestaurantPhotoResponse;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;
import com.pauluna.mesa.restaurant.domain.RestaurantPhoto;
import com.pauluna.mesa.restaurant.domain.RestaurantPhotoMetadata;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantPhotoRepository;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class RestaurantPhotoService {

    private static final long MAXIMUM_FILE_SIZE =
            5L * 1024L * 1024L;

    private static final long MAXIMUM_PHOTOS_PER_RESTAURANT = 30;

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/heic",
                    "image/heif"
            );

    private final GroupService groupService;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupRestaurantRepository groupRestaurantRepository;
    private final RestaurantPhotoRepository restaurantPhotoRepository;
    private final UserRepository userRepository;

    public RestaurantPhotoService(
            GroupService groupService,
            GroupMemberRepository groupMemberRepository,
            GroupRestaurantRepository groupRestaurantRepository,
            RestaurantPhotoRepository restaurantPhotoRepository,
            UserRepository userRepository
    ) {
        this.groupService = groupService;
        this.groupMemberRepository = groupMemberRepository;
        this.groupRestaurantRepository = groupRestaurantRepository;
        this.restaurantPhotoRepository = restaurantPhotoRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<RestaurantPhotoResponse> getPhotos(
            UUID groupId,
            UUID groupRestaurantId,
            UUID userId
    ) {
        groupService.validateMemberAccess(groupId, userId);
        findGroupRestaurant(groupId, groupRestaurantId);

        List<RestaurantPhotoMetadata> photos =
                restaurantPhotoRepository
                        .findMetadataByGroupRestaurantId(groupRestaurantId);

        if (photos.isEmpty()) {
            return List.of();
        }

        Set<UUID> uploaderIds = photos
                .stream()
                .map(RestaurantPhotoMetadata::uploadedByUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, User> usersById = userRepository
                .findAllById(uploaderIds)
                .stream()
                .collect(Collectors.toMap(
                        User::getId,
                        Function.identity()
                ));

        boolean currentUserIsOwner =
                groupMemberRepository
                        .findByGroupIdAndUserId(groupId, userId)
                        .map(membership ->
                                membership.getRole() == GroupRole.OWNER
                        )
                        .orElse(false);

        return photos
                .stream()
                .map(photo -> toResponse(
                        groupId,
                        groupRestaurantId,
                        photo,
                        usersById.get(photo.uploadedByUserId()),
                        userId,
                        currentUserIsOwner
                ))
                .toList();
    }

    public RestaurantPhotoResponse savePhoto(
            UUID groupId,
            UUID groupRestaurantId,
            UUID userId,
            MultipartFile file
    ) {
        groupService.validateRestaurantManagementAccess(groupId, userId);
        validateFile(file);

        GroupRestaurant groupRestaurant =
                findGroupRestaurant(groupId, groupRestaurantId);

        if (!isVisited(groupRestaurant.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Marca el restaurante como visitado antes de añadir fotos."
            );
        }

        if (
                restaurantPhotoRepository
                        .countByGroupRestaurantId(groupRestaurantId)
                        >= MAXIMUM_PHOTOS_PER_RESTAURANT
        ) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este restaurante ya tiene el máximo de 30 fotos del grupo."
            );
        }

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

        RestaurantPhoto savedPhoto =
                restaurantPhotoRepository.saveAndFlush(
                        new RestaurantPhoto(
                                groupRestaurantId,
                                userId,
                                contentType,
                                imageData
                        )
                );

        User uploader = userRepository
                .findById(userId)
                .orElse(null);

        return toResponse(
                groupId,
                groupRestaurantId,
                new RestaurantPhotoMetadata(
                        savedPhoto.getId(),
                        savedPhoto.getUploadedByUserId(),
                        savedPhoto.getCreatedAt()
                ),
                uploader,
                userId,
                isOwner(groupId, userId)
        );
    }

    @Transactional(readOnly = true)
    public RestaurantPhotoContent getPhotoContent(
            UUID groupId,
            UUID groupRestaurantId,
            UUID photoId,
            UUID userId
    ) {
        groupService.validateMemberAccess(groupId, userId);
        findGroupRestaurant(groupId, groupRestaurantId);

        RestaurantPhoto photo = findPhoto(photoId, groupRestaurantId);

        return new RestaurantPhotoContent(
                photo.getContentType(),
                photo.getImageData()
        );
    }

    public void deletePhoto(
            UUID groupId,
            UUID groupRestaurantId,
            UUID photoId,
            UUID userId
    ) {
        groupService.validateMemberAccess(groupId, userId);
        findGroupRestaurant(groupId, groupRestaurantId);

        RestaurantPhoto photo = findPhoto(photoId, groupRestaurantId);

        if (!userId.equals(photo.getUploadedByUserId())) {
            groupService.validateOwnerAccess(groupId, userId);
        }

        restaurantPhotoRepository.delete(photo);
        restaurantPhotoRepository.flush();
    }

    private GroupRestaurant findGroupRestaurant(
            UUID groupId,
            UUID groupRestaurantId
    ) {
        return groupRestaurantRepository
                .findByIdAndGroupId(groupRestaurantId, groupId)
                .orElseThrow(() ->
                        new GroupRestaurantNotFoundException(groupRestaurantId)
                );
    }

    private RestaurantPhoto findPhoto(
            UUID photoId,
            UUID groupRestaurantId
    ) {
        return restaurantPhotoRepository
                .findByIdAndGroupRestaurantId(photoId, groupRestaurantId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "No se ha encontrado la foto."
                        )
                );
    }

    private RestaurantPhotoResponse toResponse(
            UUID groupId,
            UUID groupRestaurantId,
            RestaurantPhotoMetadata photo,
            User uploader,
            UUID currentUserId,
            boolean currentUserIsOwner
    ) {
        boolean uploadedByCurrentUser =
                currentUserId.equals(photo.uploadedByUserId());

        return new RestaurantPhotoResponse(
                photo.id(),
                buildPhotoUrl(
                        groupId,
                        groupRestaurantId,
                        photo.id(),
                        photo.createdAt()
                ),
                photo.uploadedByUserId(),
                uploader != null ? uploader.getName() : "Usuario eliminado",
                uploader != null ? uploader.getUsername() : null,
                uploader != null ? uploader.getAvatarUrl() : null,
                uploadedByCurrentUser,
                uploadedByCurrentUser || currentUserIsOwner,
                photo.createdAt()
        );
    }

    private String buildPhotoUrl(
            UUID groupId,
            UUID groupRestaurantId,
            UUID photoId,
            Instant createdAt
    ) {
        return "/groups/"
                + groupId
                + "/restaurants/"
                + groupRestaurantId
                + "/photos/"
                + photoId
                + "/content?v="
                + createdAt.toEpochMilli();
    }

    private boolean isOwner(UUID groupId, UUID userId) {
        return groupMemberRepository
                .findByGroupIdAndUserId(groupId, userId)
                .map(membership ->
                        membership.getRole() == GroupRole.OWNER
                )
                .orElse(false);
    }

    private boolean isVisited(GroupRestaurantStatus status) {
        return status == GroupRestaurantStatus.VISITED
                || status == GroupRestaurantStatus.WANT_TO_REPEAT
                || status == GroupRestaurantStatus.DO_NOT_REPEAT;
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
                        contentType.trim().toLowerCase(Locale.ROOT)
                )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El archivo debe ser una imagen JPG, PNG, WEBP o HEIC."
            );
        }
    }
}
