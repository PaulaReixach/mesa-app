package com.pauluna.mesa.notification.application;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.notification.api.RegisterPushDeviceRequest;
import com.pauluna.mesa.notification.api.UnregisterPushDeviceRequest;
import com.pauluna.mesa.notification.domain.PushDevice;
import com.pauluna.mesa.notification.infrastructure.PushDeviceRepository;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class PushDeviceService {

    private final PushDeviceRepository
            pushDeviceRepository;

    private final UserRepository userRepository;

    public PushDeviceService(
            PushDeviceRepository pushDeviceRepository,
            UserRepository userRepository
    ) {
        this.pushDeviceRepository =
                pushDeviceRepository;

        this.userRepository =
                userRepository;
    }

    public void registerDevice(
            UUID userId,
            RegisterPushDeviceRequest request
    ) {
        validateUserExists(userId);

        String token =
                request.expoPushToken().trim();

        validateExpoPushToken(token);

        String deviceName =
                normalizeOptionalValue(
                        request.deviceName()
                );

        PushDevice pushDevice =
                pushDeviceRepository
                        .findByExpoPushToken(token)
                        .orElseGet(() ->
                                new PushDevice(
                                        userId,
                                        token,
                                        request.platform(),
                                        deviceName
                                )
                        );

        pushDevice.register(
                userId,
                request.platform(),
                deviceName
        );

        pushDeviceRepository
                .saveAndFlush(pushDevice);
    }

    public void unregisterDevice(
            UUID userId,
            UnregisterPushDeviceRequest request
    ) {
        String token =
                request.expoPushToken().trim();

        pushDeviceRepository
                .findByUserIdAndExpoPushToken(
                        userId,
                        token
                )
                .ifPresent(
                        pushDeviceRepository::delete
                );
    }

    private void validateExpoPushToken(
            String token
    ) {
        boolean validToken =
                token.startsWith(
                        "ExponentPushToken["
                )
                || token.startsWith(
                        "ExpoPushToken["
                );

        if (!validToken) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El token push no tiene un formato válido."
            );
        }
    }

    private void validateUserExists(
            UUID userId
    ) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "El usuario no existe."
            );
        }
    }

    private String normalizeOptionalValue(
            String value
    ) {
        if (
                value == null
                || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }
}