package com.pauluna.mesa.group.api;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.pauluna.mesa.group.application.GroupInvitationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/groups/{groupId}/invitations")
public class GroupInvitationController {

    private final GroupInvitationService invitationService;

    public GroupInvitationController(
            GroupInvitationService invitationService
    ) {
        this.invitationService = invitationService;
    }

    @PostMapping
    public ResponseEntity<GroupInvitationResponse> createInvitation(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateGroupInvitationRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID ownerUserId = UUID.fromString(jwt.getSubject());

        GroupInvitationResponse invitation =
                invitationService.createInvitation(
                        groupId,
                        request,
                        ownerUserId
                );

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{invitationId}")
                .buildAndExpand(invitation.id())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(invitation);
    }

    @GetMapping
    public ResponseEntity<List<GroupInvitationResponse>>
    getGroupInvitations(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID ownerUserId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                invitationService.getGroupInvitations(
                        groupId,
                        ownerUserId
                )
        );
    }

    @DeleteMapping("/{invitationId}")
    public ResponseEntity<Void> cancelInvitation(
            @PathVariable UUID groupId,
            @PathVariable UUID invitationId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID ownerUserId = UUID.fromString(jwt.getSubject());

        invitationService.cancelInvitation(
                groupId,
                invitationId,
                ownerUserId
        );

        return ResponseEntity.noContent().build();
    }
}
