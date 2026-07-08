package com.pauluna.mesa.group.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "group_invitations")
public class GroupInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "group_id", nullable = false)
    private UUID groupId;

    @Column(name = "invited_user_id", nullable = false)
    private UUID invitedUserId;

    @Column(name = "invited_by_user_id", nullable = false)
    private UUID invitedByUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private GroupInvitationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GroupInvitation() {
        // Constructor requerido por JPA.
    }

    public GroupInvitation(
            UUID groupId,
            UUID invitedUserId,
            UUID invitedByUserId
    ) {
        this.groupId = groupId;
        this.invitedUserId = invitedUserId;
        this.invitedByUserId = invitedByUserId;
        this.status = GroupInvitationStatus.PENDING;
    }

    public void accept() {
        ensurePending();
        this.status = GroupInvitationStatus.ACCEPTED;
    }

    public void reject() {
        ensurePending();
        this.status = GroupInvitationStatus.REJECTED;
    }

    public void cancel() {
        ensurePending();
        this.status = GroupInvitationStatus.CANCELLED;
    }

    private void ensurePending() {
        if (status != GroupInvitationStatus.PENDING) {
            throw new IllegalStateException("La invitación ya ha sido resuelta.");
        }
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getGroupId() {
        return groupId;
    }

    public UUID getInvitedUserId() {
        return invitedUserId;
    }

    public UUID getInvitedByUserId() {
        return invitedByUserId;
    }

    public GroupInvitationStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
