package com.pauluna.mesa.group.domain;

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

@Entity
@Table(name = "restaurant_groups")
public class RestaurantGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "city", length = 100)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(name = "privacy", nullable = false, length = 20)
    private GroupPrivacy privacy;

    @Column(name = "accepting_collaborators", nullable = false)
    private boolean acceptingCollaborators;

    @Column(name = "owner_user_id", nullable = false)
    private UUID ownerUserId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected RestaurantGroup() {
        // Constructor requerido por JPA.
    }

    public RestaurantGroup(
            String name,
            String description,
            String imageUrl,
            String city,
            GroupPrivacy privacy,
            UUID ownerUserId
    ) {
        this(
                name,
                description,
                imageUrl,
                city,
                privacy,
                true,
                ownerUserId
        );
    }

    public RestaurantGroup(
            String name,
            String description,
            String imageUrl,
            String city,
            GroupPrivacy privacy,
            boolean acceptingCollaborators,
            UUID ownerUserId
    ) {
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.city = city;
        this.privacy = privacy;
        this.acceptingCollaborators = acceptingCollaborators;
        this.ownerUserId = ownerUserId;
    }

    public void updateDetails(
            String name,
            String description,
            String city,
            GroupPrivacy privacy
    ) {
        updateDetails(
                name,
                description,
                city,
                privacy,
                acceptingCollaborators
        );
    }

    public void updateDetails(
            String name,
            String description,
            String city,
            GroupPrivacy privacy,
            boolean acceptingCollaborators
    ) {
        this.name = Objects.requireNonNull(
                name,
                "El nombre del grupo es obligatorio."
        );
        this.description = description;
        this.city = city;
        this.privacy = Objects.requireNonNull(
                privacy,
                "La privacidad del grupo es obligatoria."
        );
        this.acceptingCollaborators = acceptingCollaborators;
    }

    public void updateImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getCity() {
        return city;
    }

    public GroupPrivacy getPrivacy() {
        return privacy;
    }

    public boolean isAcceptingCollaborators() {
        return acceptingCollaborators;
    }

    public UUID getOwnerUserId() {
        return ownerUserId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
