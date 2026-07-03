package com.pauluna.mesa.support.api;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.support.application.SupportRequestService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/support/requests")
public class SupportRequestController {

    private final SupportRequestService
            supportRequestService;

    public SupportRequestController(
            SupportRequestService
                    supportRequestService
    ) {
        this.supportRequestService =
                supportRequestService;
    }

    @PostMapping
    public ResponseEntity<SupportRequestResponse>
    createSupportRequest(
            @Valid
            @RequestBody
            CreateSupportRequestRequest request,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        SupportRequestResponse response =
                supportRequestService
                        .createSupportRequest(
                                userId,
                                request
                        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}