package com.pauluna.mesa.group.api;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.group.application.PublicGroupService;

@RestController
@RequestMapping("/groups/public")
public class PublicGroupController {

    private final PublicGroupService publicGroupService;

    public PublicGroupController(
            PublicGroupService publicGroupService
    ) {
        this.publicGroupService = publicGroupService;
    }

    @GetMapping
    public ResponseEntity<List<PublicGroupSummaryResponse>>
    getPublicGroups(
            @RequestParam(required = false)
            String city,

            @RequestParam(required = false)
            String query,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                publicGroupService.getPublicGroups(
                        city,
                        query,
                        userId
                )
        );
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<PublicGroupDetailResponse>
    getPublicGroup(
            @PathVariable
            UUID groupId,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                publicGroupService.getPublicGroup(
                        groupId,
                        userId
                )
        );
    }

    @PostMapping("/{groupId}/followers")
    public ResponseEntity<PublicGroupSummaryResponse>
    followGroup(
            @PathVariable
            UUID groupId,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                publicGroupService.followGroup(
                        groupId,
                        userId
                )
        );
    }

    @DeleteMapping("/{groupId}/followers")
    public ResponseEntity<PublicGroupSummaryResponse>
    unfollowGroup(
            @PathVariable
            UUID groupId,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                publicGroupService.unfollowGroup(
                        groupId,
                        userId
                )
        );
    }
}
