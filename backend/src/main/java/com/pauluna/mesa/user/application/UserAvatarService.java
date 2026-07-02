package com.pauluna.mesa.user.application;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.user.api.UserResponse;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.domain.UserAvatar;
import com.pauluna.mesa.user.infrastructure.UserAvatarRepository;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class UserAvatarService {

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

    private final UserRepository userRepository;
    private final UserAvatarRepository userAvatarRepository;

    public UserAvatarService(
            UserRepository userRepository,
            UserAvatarRepository userAvatarRepository
    ) {
        this.userRepository = userRepository;
        this.userAvatarRepository = userAvatarRepository;
    }

    public UserResponse saveAvatar(
            UUID userId,
            MultipartFile file
    ) {
        validateFile(file);

        User user = findUser(userId);

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

        UserAvatar avatar = userAvatarRepository
                .findById(userId)
                .orElseGet(() ->
                        new UserAvatar(
                                userId,
                                contentType,
                                imageData
                        )
                );

        avatar.update(
                contentType,
                imageData
        );

        userAvatarRepository.save(avatar);

        String avatarUrl =
                "/users/"
                        + userId
                        + "/avatar?v="
                        + UUID.randomUUID();

        user.updateAvatarUrl(avatarUrl);

        User updatedUser =
                userRepository.saveAndFlush(user);

        return UserResponse.from(updatedUser);
    }

    @Transactional(readOnly = true)
    public UserAvatarContent getAvatar(
            UUID userId
    ) {
        UserAvatar avatar = userAvatarRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "El usuario no tiene foto de perfil."
                        )
                );

        return new UserAvatarContent(
                avatar.getContentType(),
                avatar.getImageData()
        );
    }

    public UserResponse deleteAvatar(
            UUID userId
    ) {
        User user = findUser(userId);

        userAvatarRepository.deleteById(userId);

        user.updateAvatarUrl(null);

        User updatedUser =
                userRepository.saveAndFlush(user);

        return UserResponse.from(updatedUser);
    }

    private User findUser(UUID userId) {
        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(userId)
                );
    }

    private void validateFile(
            MultipartFile file
    ) {
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