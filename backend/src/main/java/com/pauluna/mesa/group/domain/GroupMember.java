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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "group_members",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_group_members_group_user",
                        columnNames = {"group_id", "user_id"}
                )
        }
)
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "group_id", nullable = false)
    private UUID groupId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private GroupRole role;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    protected GroupMember() {
        // Constructor requerido por JPA.
    }

    public GroupMember(
            UUID groupId,
            UUID userId,
            GroupRole role
    ) {
        this.groupId = groupId;
        this.userId = userId;
        this.role = role;
    }

    public void becomeMember() {
        if (role != GroupRole.OWNER) {
            this.role = GroupRole.MEMBER;
        }
    }

    public void becomeContributor() {
        if (role != GroupRole.OWNER) {
            this.role = GroupRole.CONTRIBUTOR;
        }
    }

    @PrePersist
    void onCreate() {
        this.joinedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getGroupId() {
        return groupId;
    }

    public UUID getUserId() {
        return userId;
    }

    public GroupRole getRole() {
        return role;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }
}
