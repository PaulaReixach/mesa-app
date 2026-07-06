package com.pauluna.mesa.group.api;

import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.pauluna.mesa.group.application.GroupImageContent;
import com.pauluna.mesa.group.application.GroupImageService;
import com.pauluna.mesa.group.application.GroupService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/groups")
public class GroupController {

    private final GroupService groupService;

    private final GroupImageService
            groupImageService;

    public GroupController(
            GroupService groupService,
            GroupImageService groupImageService
    ) {
        this.groupService = groupService;

        this.groupImageService =
                groupImageService;
    }

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            @Valid
            @RequestBody
            CreateGroupRequest request,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        GroupResponse createdGroup =
                groupService.createGroup(
                        request,
                        userId
                );

        URI location =
                ServletUriComponentsBuilder
                        .fromCurrentRequest()
                        .path("/{groupId}")
                        .buildAndExpand(
                                createdGroup.id()
                        )
                        .toUri();

        return ResponseEntity
                .created(location)
                .body(createdGroup);
    }

    @GetMapping
    public ResponseEntity<List<GroupResponse>>
    getGroups(
            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                groupService.getGroups(userId)
        );
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponse>
    getGroup(
            @PathVariable
            UUID groupId,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                groupService.getGroup(
                        groupId,
                        userId
                )
        );
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<GroupResponse>
    updateGroup(
            @PathVariable
            UUID groupId,

            @Valid
            @RequestBody
            UpdateGroupRequest request,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                groupService.updateGroup(
                        groupId,
                        request,
                        userId
                )
        );
    }

    @PutMapping(
            value = "/{groupId}/image",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<GroupResponse>
    updateGroupImage(
            @PathVariable
            UUID groupId,

            @RequestPart("file")
            MultipartFile file,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                groupImageService.saveImage(
                        groupId,
                        userId,
                        file
                )
        );
    }

    @DeleteMapping("/{groupId}/image")
    public ResponseEntity<GroupResponse>
    deleteGroupImage(
            @PathVariable
            UUID groupId,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        UUID userId =
                UUID.fromString(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(
                groupImageService.deleteImage(
                        groupId,
                        userId
                )
        );
    }

    @GetMapping("/{groupId}/image")
    public ResponseEntity<byte[]>
    getGroupImage(
            @PathVariable
            UUID groupId
    ) {
        GroupImageContent image =
                groupImageService.getImage(
                        groupId
                );

        return ResponseEntity
                .ok()
                .contentType(
                        MediaType.parseMediaType(
                                image.contentType()
                        )
                )
                .cacheControl(
                        CacheControl
                                .maxAge(
                                        Duration.ofDays(30)
                                )
                                .cachePublic()
                )
                .body(image.imageData());
    }
}
