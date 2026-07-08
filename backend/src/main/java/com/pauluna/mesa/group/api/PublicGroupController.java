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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.group.application.GroupCollaborationService;
import com.pauluna.mesa.group.application.PublicGroupCollaborationStateService;
import com.pauluna.mesa.group.application.PublicGroupCopyService;
import com.pauluna.mesa.group.application.PublicGroupMemberService;
import com.pauluna.mesa.group.application.PublicGroupService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/groups/public")
public class PublicGroupController {

    private final PublicGroupService publicGroupService;
    private final PublicGroupCopyService publicGroupCopyService;
    private final GroupCollaborationService collaborationService;
    private final PublicGroupCollaborationStateService collaborationStateService;
    private final PublicGroupMemberService publicGroupMemberService;

    public PublicGroupController(
            PublicGroupService publicGroupService,
            PublicGroupCopyService publicGroupCopyService,
            GroupCollaborationService collaborationService,
            PublicGroupCollaborationStateService collaborationStateService,
            PublicGroupMemberService publicGroupMemberService
    ) {
        this.publicGroupService = publicGroupService;
        this.publicGroupCopyService = publicGroupCopyService;
        this.collaborationService = collaborationService;
        this.collaborationStateService = collaborationStateService;
        this.publicGroupMemberService = publicGroupMemberService;
    }

    @GetMapping
    public ResponseEntity<List<PublicGroupSummaryResponse>> getPublicGroups(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String query,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(
                publicGroupService.getPublicGroups(city, query, userId)
        );
    }

    @GetMapping("/following")
    public ResponseEntity<List<PublicGroupSummaryResponse>> getFollowedGroups(
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(publicGroupService.getFollowedGroups(userId));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<PublicGroupDetailResponse> getPublicGroup(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(
                publicGroupService.getPublicGroup(groupId, userId)
        );
    }

    @GetMapping("/{groupId}/collaborators")
    public ResponseEntity<List<GroupMemberResponse>> getCollaborators(
            @PathVariable UUID groupId
    ) {
        return ResponseEntity.ok(
                publicGroupMemberService.getCollaborators(groupId)
        );
    }

    @GetMapping("/{groupId}/collaboration-state")
    public ResponseEntity<PublicGroupCollaborationStateResponse>
    getCollaborationState(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(
                collaborationStateService.getState(groupId, userId)
        );
    }

    @PostMapping("/{groupId}/collaboration-requests")
    public ResponseEntity<CollaborationRequestResponse> requestCollaboration(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateCollaborationRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(
                collaborationService.requestCollaboration(
                        groupId,
                        request,
                        userId
                )
        );
    }

    @DeleteMapping("/{groupId}/collaboration-requests/me")
    public ResponseEntity<CollaborationRequestResponse> cancelRequest(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(
                collaborationService.cancelRequest(groupId, userId)
        );
    }

    @DeleteMapping("/{groupId}/collaborators/me")
    public ResponseEntity<Void> leaveCollaboration(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        collaborationService.leaveCollaboration(groupId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{groupId}/collaboration-requests")
    public ResponseEntity<List<CollaborationRequestResponse>> getRequests(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(
                collaborationService.getRequests(groupId, userId)
        );
    }

    @PostMapping("/{groupId}/collaboration-requests/{requestId}/accept")
    public ResponseEntity<CollaborationRequestResponse> acceptRequest(
            @PathVariable UUID groupId,
            @PathVariable UUID requestId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(
                collaborationService.acceptRequest(
                        groupId,
                        requestId,
                        userId
                )
        );
    }

    @PostMapping("/{groupId}/collaboration-requests/{requestId}/reject")
    public ResponseEntity<CollaborationRequestResponse> rejectRequest(
            @PathVariable UUID groupId,
            @PathVariable UUID requestId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(
                collaborationService.rejectRequest(
                        groupId,
                        requestId,
                        userId
                )
        );
    }

    @GetMapping("/{groupId}/copy-destinations")
    public ResponseEntity<List<GroupResponse>> getCopyDestinations(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(
                publicGroupCopyService.getCopyDestinations(groupId, userId)
        );
    }

    @PostMapping("/{groupId}/copy")
    public ResponseEntity<CopyPublicRestaurantsResponse> copyRestaurants(
            @PathVariable UUID groupId,
            @Valid @RequestBody CopyPublicRestaurantsRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(
                publicGroupCopyService.copyRestaurants(
                        groupId,
                        request,
                        userId
                )
        );
    }

    @PostMapping("/{groupId}/followers")
    public ResponseEntity<PublicGroupSummaryResponse> followGroup(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(
                publicGroupService.followGroup(groupId, userId)
        );
    }

    @DeleteMapping("/{groupId}/followers")
    public ResponseEntity<PublicGroupSummaryResponse> unfollowGroup(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(
                publicGroupService.unfollowGroup(groupId, userId)
        );
    }
}
