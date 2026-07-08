package com.pauluna.mesa.restaurant.domain;

import java.math.BigDecimal;
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
@Table(name = "restaurant_proposals")
public class RestaurantProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "group_id", nullable = false)
    private UUID groupId;

    @Column(name = "proposed_by_user_id", nullable = false)
    private UUID proposedByUserId;

    @Column(name = "restaurant_identity_key", nullable = false, length = 600)
    private String restaurantIdentityKey;

    @Column(name = "provider", length = 50)
    private String provider;

    @Column(name = "external_place_id", length = 255)
    private String externalPlaceId;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "address", length = 300)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 6)
    private BigDecimal longitude;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "message", length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RestaurantProposalStatus status;

    @Column(name = "resolved_by_user_id")
    private UUID resolvedByUserId;

    @Column(name = "created_group_restaurant_id")
    private UUID createdGroupRestaurantId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected RestaurantProposal() {
        // Constructor requerido por JPA.
    }

    public RestaurantProposal(
            UUID groupId,
            UUID proposedByUserId,
            String restaurantIdentityKey,
            String provider,
            String externalPlaceId,
            String name,
            String address,
            String city,
            String country,
            BigDecimal latitude,
            BigDecimal longitude,
            String category,
            String message
    ) {
        this.groupId = groupId;
        this.proposedByUserId = proposedByUserId;
        this.restaurantIdentityKey = restaurantIdentityKey;
        this.provider = provider;
        this.externalPlaceId = externalPlaceId;
        this.name = name;
        this.address = address;
        this.city = city;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.category = category;
        this.message = message;
        this.status = RestaurantProposalStatus.PENDING;
    }

    public void accept(
            UUID resolvedByUserId,
            UUID createdGroupRestaurantId
    ) {
        this.status = RestaurantProposalStatus.ACCEPTED;
        this.resolvedByUserId = resolvedByUserId;
        this.createdGroupRestaurantId = createdGroupRestaurantId;
    }

    public void reject(UUID resolvedByUserId) {
        this.status = RestaurantProposalStatus.REJECTED;
        this.resolvedByUserId = resolvedByUserId;
    }

    public void cancel() {
        this.status = RestaurantProposalStatus.CANCELLED;
    }

    public void markDuplicate(UUID resolvedByUserId) {
        this.status = RestaurantProposalStatus.DUPLICATE;
        this.resolvedByUserId = resolvedByUserId;
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

    public UUID getProposedByUserId() {
        return proposedByUserId;
    }

    public String getRestaurantIdentityKey() {
        return restaurantIdentityKey;
    }

    public String getProvider() {
        return provider;
    }

    public String getExternalPlaceId() {
        return externalPlaceId;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public String getCategory() {
        return category;
    }

    public String getMessage() {
        return message;
    }

    public RestaurantProposalStatus getStatus() {
        return status;
    }

    public UUID getResolvedByUserId() {
        return resolvedByUserId;
    }

    public UUID getCreatedGroupRestaurantId() {
        return createdGroupRestaurantId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
