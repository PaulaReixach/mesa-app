package com.pauluna.mesa.restaurant.domain;

import java.time.Instant;
import java.util.Objects;
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
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "group_restaurants",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_group_restaurants_group_restaurant",
                        columnNames = {
                                "group_id",
                                "restaurant_id"
                        }
                )
        }
)
public class GroupRestaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "group_id",
            nullable = false
    )
    private UUID groupId;

    @Column(
            name = "restaurant_id",
            nullable = false
    )
    private UUID restaurantId;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private GroupRestaurantStatus status;

    @Column(
            name = "proposed_by_user_id",
            nullable = false
    )
    private UUID proposedByUserId;

    @Column(
            name = "group_notes",
            length = 1000
    )
    private String groupNotes;

    @Column(name = "status_updated_by_user_id")
    private UUID statusUpdatedByUserId;

    @Column(name = "copied_from_group_id")
    private UUID copiedFromGroupId;

    @Column(name = "copied_from_group_restaurant_id")
    private UUID copiedFromGroupRestaurantId;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    protected GroupRestaurant() {
        // Constructor requerido por JPA.
    }

    public GroupRestaurant(
            UUID groupId,
            UUID restaurantId,
            GroupRestaurantStatus status,
            UUID proposedByUserId,
            String groupNotes
    ) {
        this(
                groupId,
                restaurantId,
                status,
                proposedByUserId,
                groupNotes,
                null,
                null
        );
    }

    public GroupRestaurant(
            UUID groupId,
            UUID restaurantId,
            GroupRestaurantStatus status,
            UUID proposedByUserId,
            String groupNotes,
            UUID copiedFromGroupId,
            UUID copiedFromGroupRestaurantId
    ) {
        this.groupId = groupId;
        this.restaurantId = restaurantId;
        this.status = status;
        this.proposedByUserId = proposedByUserId;
        this.groupNotes = groupNotes;
        this.statusUpdatedByUserId = proposedByUserId;
        this.copiedFromGroupId = copiedFromGroupId;
        this.copiedFromGroupRestaurantId =
                copiedFromGroupRestaurantId;
    }

    public void changeStatus(
            GroupRestaurantStatus status
    ) {
        changeStatus(status, proposedByUserId);
    }

    public void changeStatus(
            GroupRestaurantStatus status,
            UUID updatedByUserId
    ) {
        this.status = Objects.requireNonNull(
                status,
                "El estado del restaurante es obligatorio."
        );
        this.statusUpdatedByUserId = Objects.requireNonNull(
                updatedByUserId,
                "La persona que actualiza el estado es obligatoria."
        );
    }

    public void changeRestaurantId(
            UUID restaurantId
    ) {
        this.restaurantId = Objects.requireNonNull(
                restaurantId,
                "El restaurante es obligatorio."
        );
    }

    public void updateGroupNotes(
            String groupNotes
    ) {
        this.groupNotes = groupNotes;
    }

    public void changeProposedByUserId(
            UUID proposedByUserId
    ) {
        this.proposedByUserId =
                Objects.requireNonNull(
                        proposedByUserId,
                        "El usuario que propone el restaurante es obligatorio."
                );
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

    public UUID getRestaurantId() {
        return restaurantId;
    }

    public GroupRestaurantStatus getStatus() {
        return status;
    }

    public UUID getProposedByUserId() {
        return proposedByUserId;
    }

    public String getGroupNotes() {
        return groupNotes;
    }

    public UUID getStatusUpdatedByUserId() {
        return statusUpdatedByUserId;
    }

    public UUID getCopiedFromGroupId() {
        return copiedFromGroupId;
    }

    public UUID getCopiedFromGroupRestaurantId() {
        return copiedFromGroupRestaurantId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
