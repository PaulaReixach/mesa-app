package com.pauluna.mesa.group.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "group_followers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_group_followers_group_user",
                        columnNames = {
                                "group_id",
                                "user_id"
                        }
                )
        }
)
public class GroupFollower {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "group_id",
            nullable = false
    )
    private UUID groupId;

    @Column(
            name = "user_id",
            nullable = false
    )
    private UUID userId;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    protected GroupFollower() {
        // Constructor requerido por JPA.
    }

    public GroupFollower(
            UUID groupId,
            UUID userId
    ) {
        this.groupId = groupId;
        this.userId = userId;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
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

    public Instant getCreatedAt() {
        return createdAt;
    }
}
