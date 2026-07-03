package com.pauluna.mesa.user.api;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.user.application.PrivacyPreferencesService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(
        "/users/me/privacy-preferences"
)
public class PrivacyPreferencesController {

    private final PrivacyPreferencesService
            privacyPreferencesService;

    public PrivacyPreferencesController(
            PrivacyPreferencesService
                    privacyPreferencesService
    ) {
        this.privacyPreferencesService =
                privacyPreferencesService;
    }

    @GetMapping
    public ResponseEntity<PrivacyPreferencesResponse>
    getCurrentUserPrivacyPreferences(
            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                privacyPreferencesService
                        .getPreferences(userId)
        );
    }

    @PutMapping
    public ResponseEntity<PrivacyPreferencesResponse>
    updateCurrentUserPrivacyPreferences(
            @Valid
            @RequestBody
            UpdatePrivacyPreferencesRequest request,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                privacyPreferencesService
                        .updatePreferences(
                                userId,
                                request
                        )
        );
    }
}