package com.pauluna.mesa.group.api;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.pauluna.mesa.group.application.GroupService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            @Valid @RequestBody CreateGroupRequest request
    ) {
        GroupResponse createdGroup = groupService.createGroup(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{groupId}")
                .buildAndExpand(createdGroup.id())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(createdGroup);
    }

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getGroups(
            @RequestParam UUID userId
    ) {
        return ResponseEntity.ok(
                groupService.getGroups(userId)
        );
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponse> getGroup(
            @PathVariable UUID groupId,
            @RequestParam UUID userId
    ) {
        return ResponseEntity.ok(
                groupService.getGroup(groupId, userId)
        );
    }
}