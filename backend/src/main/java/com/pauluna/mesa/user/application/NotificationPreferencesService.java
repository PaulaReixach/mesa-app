package com.pauluna.mesa.user.application;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.user.api.NotificationPreferencesResponse;
import com.pauluna.mesa.user.api.UpdateNotificationPreferencesRequest;
import com.pauluna.mesa.user.domain.UserNotificationPreferences;
import com.pauluna.mesa.user.infrastructure.UserNotificationPreferencesRepository;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class NotificationPreferencesService {

    private final UserRepository userRepository;

    private final UserNotificationPreferencesRepository
            notificationPreferencesRepository;

    public NotificationPreferencesService(
            UserRepository userRepository,
            UserNotificationPreferencesRepository
                    notificationPreferencesRepository
    ) {
        this.userRepository = userRepository;

        this.notificationPreferencesRepository =
                notificationPreferencesRepository;
    }

    public NotificationPreferencesResponse getPreferences(
            UUID userId
    ) {
        validateUserExists(userId);

        UserNotificationPreferences preferences =
                notificationPreferencesRepository
                        .findById(userId)
                        .orElseGet(() ->
                                notificationPreferencesRepository
                                        .save(
                                                new UserNotificationPreferences(
                                                        userId
                                                )
                                        )
                        );

        return NotificationPreferencesResponse.from(
                preferences
        );
    }

    public NotificationPreferencesResponse updatePreferences(
            UUID userId,
            UpdateNotificationPreferencesRequest request
    ) {
        validateUserExists(userId);

        UserNotificationPreferences preferences =
                notificationPreferencesRepository
                        .findById(userId)
                        .orElseGet(() ->
                                new UserNotificationPreferences(
                                        userId
                                )
                        );

        preferences.update(
                request.notificationsEnabled(),
                request.newRestaurantsEnabled(),
                request.restaurantStatusEnabled(),
                request.ratingsEnabled(),
                request.groupActivityEnabled()
        );

        UserNotificationPreferences
                savedPreferences =
                notificationPreferencesRepository
                        .saveAndFlush(preferences);

        return NotificationPreferencesResponse.from(
                savedPreferences
        );
    }

    private void validateUserExists(
            UUID userId
    ) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }
    }
}