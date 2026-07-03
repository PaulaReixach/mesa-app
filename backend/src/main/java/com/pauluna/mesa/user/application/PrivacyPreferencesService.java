package com.pauluna.mesa.user.application;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.user.api.PrivacyPreferencesResponse;
import com.pauluna.mesa.user.api.UpdatePrivacyPreferencesRequest;
import com.pauluna.mesa.user.domain.UserPrivacyPreferences;
import com.pauluna.mesa.user.infrastructure.UserPrivacyPreferencesRepository;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class PrivacyPreferencesService {

    private final UserRepository userRepository;

    private final UserPrivacyPreferencesRepository
            privacyPreferencesRepository;

    public PrivacyPreferencesService(
            UserRepository userRepository,
            UserPrivacyPreferencesRepository
                    privacyPreferencesRepository
    ) {
        this.userRepository = userRepository;

        this.privacyPreferencesRepository =
                privacyPreferencesRepository;
    }

    public PrivacyPreferencesResponse getPreferences(
            UUID userId
    ) {
        validateUserExists(userId);

        UserPrivacyPreferences preferences =
                getOrCreatePreferences(userId);

        return PrivacyPreferencesResponse.from(
                preferences
        );
    }

    public PrivacyPreferencesResponse updatePreferences(
            UUID userId,
            UpdatePrivacyPreferencesRequest request
    ) {
        validateUserExists(userId);

        UserPrivacyPreferences preferences =
                privacyPreferencesRepository
                        .findById(userId)
                        .orElseGet(() ->
                                new UserPrivacyPreferences(
                                        userId
                                )
                        );

        preferences.update(
                request.groupInvitationsEnabled()
        );

        UserPrivacyPreferences savedPreferences =
                privacyPreferencesRepository
                        .saveAndFlush(preferences);

        return PrivacyPreferencesResponse.from(
                savedPreferences
        );
    }

    @Transactional(readOnly = true)
    public boolean areGroupInvitationsEnabled(
            UUID userId
    ) {
        return privacyPreferencesRepository
                .findById(userId)
                .map(
                        UserPrivacyPreferences
                                ::isGroupInvitationsEnabled
                )
                .orElse(true);
    }

    private UserPrivacyPreferences getOrCreatePreferences(
            UUID userId
    ) {
        return privacyPreferencesRepository
                .findById(userId)
                .orElseGet(() ->
                        privacyPreferencesRepository
                                .save(
                                        new UserPrivacyPreferences(
                                                userId
                                        )
                                )
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