package com.pauluna.mesa.user.api;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.user.application.UserSearchService;

import jakarta.validation.constraints.Size;

@Validated
@RestController
@RequestMapping("/users/search")
public class UserSearchController {

    private final UserSearchService userSearchService;

    public UserSearchController(
            UserSearchService userSearchService
    ) {
        this.userSearchService = userSearchService;
    }

    @GetMapping
    public ResponseEntity<List<UserSearchResponse>>
    searchInvitableUsers(
            @RequestParam(defaultValue = "")
            @Size(
                    max = 50,
                    message = "La búsqueda no puede superar los 50 caracteres."
            )
            String query,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID currentUserId =
                UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                userSearchService.searchInvitableUsers(
                        currentUserId,
                        query
                )
        );
    }
}
