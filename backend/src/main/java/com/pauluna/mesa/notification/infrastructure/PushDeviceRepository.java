package com.pauluna.mesa.notification.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.notification.domain.PushDevice;

public interface PushDeviceRepository
        extends JpaRepository<PushDevice, UUID> {

    Optional<PushDevice> findByExpoPushToken(
            String expoPushToken
    );

    Optional<PushDevice>
    findByUserIdAndExpoPushToken(
            UUID userId,
            String expoPushToken
    );

    List<PushDevice> findAllByUserIdAndActiveTrue(
            UUID userId
    );
}