package com.pauluna.mesa.user.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_privacy_preferences")
public class UserPrivacyPreferences {

    @Id
    @Column(
            name = "user_id",
            nullable = false
    )
    private UUID userId;

    @Column(
            name = "group_invitations_enabled",
            nullable = false
    )
    private boolean groupInvitationsEnabled;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    protected UserPrivacyPreferences() {
        // Constructor requerido por JPA.
    }

    public UserPrivacyPreferences(
            UUID userId
    ) {
        this.userId = userId;
        this.groupInvitationsEnabled = true;
    }

    public void update(
            boolean groupInvitationsEnabled
    ) {
        this.groupInvitationsEnabled =
                groupInvitationsEnabled;
    }

    @PrePersist
    @PreUpdate
    void updateTimestamp() {
        this.updatedAt = Instant.now();
    }

    public UUID getUserId() {
        return userId;
    }

    public boolean isGroupInvitationsEnabled() {
        return groupInvitationsEnabled;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}