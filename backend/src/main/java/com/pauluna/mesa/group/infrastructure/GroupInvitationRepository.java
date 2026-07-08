package com.pauluna.mesa.group.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.group.domain.GroupInvitation;
import com.pauluna.mesa.group.domain.GroupInvitationStatus;

public interface GroupInvitationRepository
        extends JpaRepository<GroupInvitation, UUID> {

    Optional<GroupInvitation> findByIdAndGroupId(
            UUID id,
            UUID groupId
    );

    Optional<GroupInvitation> findByIdAndInvitedUserId(
            UUID id,
            UUID invitedUserId
    );

    Optional<GroupInvitation>
    findByGroupIdAndInvitedUserIdAndStatus(
            UUID groupId,
            UUID invitedUserId,
            GroupInvitationStatus status
    );

    List<GroupInvitation>
    findAllByGroupIdOrderByCreatedAtDesc(
            UUID groupId
    );

    List<GroupInvitation>
    findAllByInvitedUserIdOrderByCreatedAtDesc(
            UUID invitedUserId
    );
}
