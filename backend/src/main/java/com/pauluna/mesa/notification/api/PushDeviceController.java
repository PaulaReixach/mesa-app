package com.pauluna.mesa.notification.api;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.notification.application.PushDeviceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users/me/push-devices")
public class PushDeviceController {

    private final PushDeviceService
            pushDeviceService;

    public PushDeviceController(
            PushDeviceService pushDeviceService
    ) {
        this.pushDeviceService =
                pushDeviceService;
    }

    @PostMapping
    public ResponseEntity<Void> registerDevice(
            @Valid
            @RequestBody
            RegisterPushDeviceRequest request,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        pushDeviceService.registerDevice(
                userId,
                request
        );

        return ResponseEntity
                .noContent()
                .build();
    }

    @DeleteMapping
    public ResponseEntity<Void> unregisterDevice(
            @Valid
            @RequestBody
            UnregisterPushDeviceRequest request,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        pushDeviceService.unregisterDevice(
                userId,
                request
        );

        return ResponseEntity
                .noContent()
                .build();
    }
}