package com.pauluna.mesa.group.api;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.group.application.GroupInvitationService;

@RestController
@RequestMapping("/group-invitations")
public class ReceivedGroupInvitationController {

    private final GroupInvitationService invitationService;

    public ReceivedGroupInvitationController(
            GroupInvitationService invitationService
    ) {
        this.invitationService = invitationService;
    }

    @GetMapping("/me")
    public ResponseEntity<List<GroupInvitationResponse>>
    getMyInvitations(
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                invitationService.getMyInvitations(userId)
        );
    }

    @PostMapping("/{invitationId}/accept")
    public ResponseEntity<GroupInvitationResponse> acceptInvitation(
            @PathVariable UUID invitationId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                invitationService.acceptInvitation(
                        invitationId,
                        userId
                )
        );
    }

    @PostMapping("/{invitationId}/reject")
    public ResponseEntity<GroupInvitationResponse> rejectInvitation(
            @PathVariable UUID invitationId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                invitationService.rejectInvitation(
                        invitationId,
                        userId
                )
        );
    }
}
