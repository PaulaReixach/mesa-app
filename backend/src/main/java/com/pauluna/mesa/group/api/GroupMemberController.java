package com.pauluna.mesa.group.api;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pauluna.mesa.group.application.GroupMemberService;

@RestController
@RequestMapping("/groups/{groupId}/members")
public class GroupMemberController {

    private final GroupMemberService groupMemberService;

    public GroupMemberController(
            GroupMemberService groupMemberService
    ) {
        this.groupMemberService = groupMemberService;
    }

    @GetMapping
    public ResponseEntity<List<GroupMemberResponse>> getMembers(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                groupMemberService.getMembers(
                        groupId,
                        userId
                )
        );
    }

    @DeleteMapping("/{memberUserId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID groupId,
            @PathVariable UUID memberUserId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());

        groupMemberService.removeMember(
                groupId,
                memberUserId,
                userId
        );

        return ResponseEntity.noContent().build();
    }
}
