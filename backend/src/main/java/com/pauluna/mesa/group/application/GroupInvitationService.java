package com.pauluna.mesa.group.application;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.api.CreateGroupInvitationRequest;
import com.pauluna.mesa.group.api.GroupInvitationResponse;
import com.pauluna.mesa.group.domain.CollaborationRequestStatus;
import com.pauluna.mesa.group.domain.GroupInvitation;
import com.pauluna.mesa.group.domain.GroupInvitationStatus;
import com.pauluna.mesa.group.domain.GroupMember;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupCollaborationRequestRepository;
import com.pauluna.mesa.group.infrastructure.GroupInvitationRepository;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.user.application.PrivacyPreferencesService;
import com.pauluna.mesa.user.application.UserNotFoundByUsernameException;
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class GroupInvitationService {

    private final GroupService groupService;
    private final RestaurantGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final GroupInvitationRepository invitationRepository;
    private final GroupCollaborationRequestRepository collaborationRequestRepository;
    private final UserRepository userRepository;
    private final PrivacyPreferencesService privacyPreferencesService;
    private final GroupInvitationNotificationService notificationService;

    public GroupInvitationService(
            GroupService groupService,
            RestaurantGroupRepository groupRepository,
            GroupMemberRepository memberRepository,
            GroupInvitationRepository invitationRepository,
            GroupCollaborationRequestRepository collaborationRequestRepository,
            UserRepository userRepository,
            PrivacyPreferencesService privacyPreferencesService,
            GroupInvitationNotificationService notificationService
    ) {
        this.groupService = groupService;
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.invitationRepository = invitationRepository;
        this.collaborationRequestRepository = collaborationRequestRepository;
        this.userRepository = userRepository;
        this.privacyPreferencesService = privacyPreferencesService;
        this.notificationService = notificationService;
    }

    public GroupInvitationResponse createInvitation(
            UUID groupId,
            CreateGroupInvitationRequest request,
            UUID ownerUserId
    ) {
        groupService.validateOwnerAccess(groupId, ownerUserId);

        RestaurantGroup group = getGroup(groupId);
        User invitedBy = getUser(ownerUserId);
        String username = request.username().trim().replaceFirst("^@", "");
        User invitedUser = userRepository
                .findByUsernameIgnoreCase(username)
                .orElseThrow(() ->
                        new UserNotFoundByUsernameException(username)
                );

        if (memberRepository.existsByGroupIdAndUserId(
                groupId,
                invitedUser.getId()
        )) {
            throw new GroupMemberAlreadyExistsException(
                    groupId,
                    invitedUser.getUsername()
            );
        }

        invitationRepository
                .findByGroupIdAndInvitedUserIdAndStatus(
                        groupId,
                        invitedUser.getId(),
                        GroupInvitationStatus.PENDING
                )
                .ifPresent(existing -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Ya existe una invitación pendiente para esta persona."
                    );
                });

        collaborationRequestRepository
                .findByGroupIdAndUserIdAndStatus(
                        groupId,
                        invitedUser.getId(),
                        CollaborationRequestStatus.PENDING
                )
                .ifPresent(existing -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Esta persona ya tiene una solicitud de colaboración pendiente."
                    );
                });

        if (!privacyPreferencesService.areGroupInvitationsEnabled(
                invitedUser.getId()
        )) {
            throw new GroupInvitationsDisabledException(
                    invitedUser.getUsername()
            );
        }

        GroupInvitation invitation = invitationRepository.saveAndFlush(
                new GroupInvitation(
                        groupId,
                        invitedUser.getId(),
                        ownerUserId
                )
        );

        notificationService.notifyInvitationCreated(
                group,
                invitedUser,
                invitedBy
        );

        return GroupInvitationResponse.from(
                invitation,
                group,
                invitedUser,
                invitedBy
        );
    }

    @Transactional(readOnly = true)
    public List<GroupInvitationResponse> getGroupInvitations(
            UUID groupId,
            UUID ownerUserId
    ) {
        groupService.validateOwnerAccess(groupId, ownerUserId);

        return invitationRepository
                .findAllByGroupIdOrderByCreatedAtDesc(groupId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GroupInvitationResponse> getMyInvitations(
            UUID invitedUserId
    ) {
        validateUserExists(invitedUserId);

        return invitationRepository
                .findAllByInvitedUserIdOrderByCreatedAtDesc(invitedUserId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public GroupInvitationResponse acceptInvitation(
            UUID invitationId,
            UUID invitedUserId
    ) {
        GroupInvitation invitation = getPendingInvitationForUser(
                invitationId,
                invitedUserId
        );

        RestaurantGroup group = getGroup(invitation.getGroupId());
        User invitedUser = getUser(invitation.getInvitedUserId());
        User invitedBy = getUser(invitation.getInvitedByUserId());

        if (!memberRepository.existsByGroupIdAndUserId(
                group.getId(),
                invitedUserId
        )) {
            GroupRole role = group.getPrivacy() == GroupPrivacy.PUBLIC
                    ? GroupRole.CONTRIBUTOR
                    : GroupRole.MEMBER;

            memberRepository.save(
                    new GroupMember(
                            group.getId(),
                            invitedUserId,
                            role
                    )
            );
        }

        invitation.accept();
        GroupInvitation savedInvitation =
                invitationRepository.saveAndFlush(invitation);

        notificationService.notifyInvitationAccepted(
                group,
                invitedUser,
                invitedBy
        );

        return GroupInvitationResponse.from(
                savedInvitation,
                group,
                invitedUser,
                invitedBy
        );
    }

    public GroupInvitationResponse rejectInvitation(
            UUID invitationId,
            UUID invitedUserId
    ) {
        GroupInvitation invitation = getPendingInvitationForUser(
                invitationId,
                invitedUserId
        );

        RestaurantGroup group = getGroup(invitation.getGroupId());
        User invitedUser = getUser(invitation.getInvitedUserId());
        User invitedBy = getUser(invitation.getInvitedByUserId());

        invitation.reject();
        GroupInvitation savedInvitation =
                invitationRepository.saveAndFlush(invitation);

        notificationService.notifyInvitationRejected(
                group,
                invitedUser,
                invitedBy
        );

        return GroupInvitationResponse.from(
                savedInvitation,
                group,
                invitedUser,
                invitedBy
        );
    }

    public void cancelInvitation(
            UUID groupId,
            UUID invitationId,
            UUID ownerUserId
    ) {
        groupService.validateOwnerAccess(groupId, ownerUserId);

        GroupInvitation invitation = invitationRepository
                .findByIdAndGroupId(invitationId, groupId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "No se ha encontrado la invitación."
                        )
                );

        ensurePending(invitation);
        invitation.cancel();
        invitationRepository.saveAndFlush(invitation);
    }

    private GroupInvitation getPendingInvitationForUser(
            UUID invitationId,
            UUID invitedUserId
    ) {
        validateUserExists(invitedUserId);

        GroupInvitation invitation = invitationRepository
                .findByIdAndInvitedUserId(
                        invitationId,
                        invitedUserId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "No se ha encontrado la invitación."
                        )
                );

        ensurePending(invitation);
        return invitation;
    }

    private void ensurePending(GroupInvitation invitation) {
        if (invitation.getStatus() != GroupInvitationStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La invitación ya ha sido resuelta."
            );
        }
    }

    private GroupInvitationResponse toResponse(
            GroupInvitation invitation
    ) {
        return GroupInvitationResponse.from(
                invitation,
                getGroup(invitation.getGroupId()),
                getUser(invitation.getInvitedUserId()),
                getUser(invitation.getInvitedByUserId())
        );
    }

    private RestaurantGroup getGroup(UUID groupId) {
        return groupRepository
                .findById(groupId)
                .orElseThrow(() ->
                        new GroupNotFoundException(groupId)
                );
    }

    private User getUser(UUID userId) {
        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(userId)
                );
    }

    private void validateUserExists(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }
    }
}
