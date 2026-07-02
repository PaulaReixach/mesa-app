package com.pauluna.mesa.user.api;

import java.time.Duration;
import java.util.UUID;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pauluna.mesa.user.application.UserAccountService;
import com.pauluna.mesa.user.application.UserAvatarContent;
import com.pauluna.mesa.user.application.UserAvatarService;
import com.pauluna.mesa.user.application.UserProfileStatsService;
import com.pauluna.mesa.user.application.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    private final UserProfileStatsService
            userProfileStatsService;

    private final UserAvatarService
            userAvatarService;

    private final UserAccountService
            userAccountService;

    public UserController(
            UserService userService,
            UserProfileStatsService userProfileStatsService,
            UserAvatarService userAvatarService,
            UserAccountService userAccountService
    ) {
        this.userService = userService;
        this.userProfileStatsService =
                userProfileStatsService;
        this.userAvatarService =
                userAvatarService;
        this.userAccountService =
                userAccountService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse>
    getCurrentUser(
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                userService.getUser(userId)
        );
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse>
    updateCurrentUser(
            @Valid
            @RequestBody
            UpdateUserProfileRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                userService.updateProfile(
                        userId,
                        request
                )
        );
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void>
    changeCurrentUserPassword(
            @Valid
            @RequestBody
            ChangePasswordRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(jwt.getSubject());

        userAccountService.changePassword(
                userId,
                request
        );

        return ResponseEntity
                .noContent()
                .build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void>
    deleteCurrentUser(
            @Valid
            @RequestBody
            DeleteAccountRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(jwt.getSubject());

        userAccountService.deleteAccount(
                userId,
                request
        );

        return ResponseEntity
                .noContent()
                .build();
    }

    @GetMapping("/me/stats")
    public ResponseEntity<UserProfileStatsResponse>
    getCurrentUserStats(
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                userProfileStatsService
                        .getStats(userId)
        );
    }

    @PutMapping(
            value = "/me/avatar",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<UserResponse>
    updateCurrentUserAvatar(
            @RequestPart("file")
            MultipartFile file,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                userAvatarService.saveAvatar(
                        userId,
                        file
                )
        );
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<UserResponse>
    deleteCurrentUserAvatar(
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                userAvatarService.deleteAvatar(
                        userId
                )
        );
    }

    @GetMapping("/{userId}/avatar")
    public ResponseEntity<byte[]>
    getUserAvatar(
            @PathVariable UUID userId
    ) {
        UserAvatarContent avatar =
                userAvatarService.getAvatar(
                        userId
                );

        return ResponseEntity
                .ok()
                .contentType(
                        MediaType.parseMediaType(
                                avatar.contentType()
                        )
                )
                .cacheControl(
                        CacheControl
                                .maxAge(
                                        Duration.ofDays(
                                                30
                                        )
                                )
                                .cachePublic()
                )
                .body(
                        avatar.imageData()
                );
    }
}