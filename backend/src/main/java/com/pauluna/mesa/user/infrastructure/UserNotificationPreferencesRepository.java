package com.pauluna.mesa.user.infrastructure;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.user.domain.UserNotificationPreferences;

public interface UserNotificationPreferencesRepository
        extends JpaRepository<
                UserNotificationPreferences,
                UUID
        > {
}