package com.pauluna.mesa.restaurant.api;

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

import com.pauluna.mesa.restaurant.application.RestaurantProposalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/groups/public/{groupId}/restaurant-proposals")
public class RestaurantProposalController {

    private final RestaurantProposalService proposalService;

    public RestaurantProposalController(
            RestaurantProposalService proposalService
    ) {
        this.proposalService = proposalService;
    }

    @PostMapping
    public ResponseEntity<RestaurantProposalResponse> createProposal(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateRestaurantProposalRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        RestaurantProposalResponse response =
                proposalService.createProposal(
                        groupId,
                        request,
                        userId
                );

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{proposalId}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<RestaurantProposalResponse>> getMyProposals(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                proposalService.getMyProposals(groupId, userId)
        );
    }

    @DeleteMapping("/{proposalId}")
    public ResponseEntity<RestaurantProposalResponse> cancelProposal(
            @PathVariable UUID groupId,
            @PathVariable UUID proposalId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                proposalService.cancelProposal(
                        groupId,
                        proposalId,
                        userId
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<RestaurantProposalResponse>> getGroupProposals(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID ownerUserId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                proposalService.getGroupProposals(
                        groupId,
                        ownerUserId
                )
        );
    }

    @GetMapping("/pending-count")
    public ResponseEntity<RestaurantProposalPendingCountResponse> getPendingCount(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID ownerUserId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                proposalService.getPendingCount(
                        groupId,
                        ownerUserId
                )
        );
    }

    @PostMapping("/{proposalId}/accept")
    public ResponseEntity<RestaurantProposalResponse> acceptProposal(
            @PathVariable UUID groupId,
            @PathVariable UUID proposalId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID ownerUserId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                proposalService.acceptProposal(
                        groupId,
                        proposalId,
                        ownerUserId
                )
        );
    }

    @PostMapping("/{proposalId}/reject")
    public ResponseEntity<RestaurantProposalResponse> rejectProposal(
            @PathVariable UUID groupId,
            @PathVariable UUID proposalId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID ownerUserId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                proposalService.rejectProposal(
                        groupId,
                        proposalId,
                        ownerUserId
                )
        );
    }
}
