package com.pauluna.mesa.restaurant.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "group_restaurant_photos")
public class RestaurantPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "group_restaurant_id", nullable = false)
    private UUID groupRestaurantId;

    @Column(name = "uploaded_by_user_id")
    private UUID uploadedByUserId;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(
            name = "image_data",
            nullable = false,
            columnDefinition = "bytea"
    )
    private byte[] imageData;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected RestaurantPhoto() {
        // Constructor requerido por JPA.
    }

    public RestaurantPhoto(
            UUID groupRestaurantId,
            UUID uploadedByUserId,
            String contentType,
            byte[] imageData
    ) {
        this.groupRestaurantId = groupRestaurantId;
        this.uploadedByUserId = uploadedByUserId;
        this.contentType = contentType;
        this.imageData = imageData;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getGroupRestaurantId() {
        return groupRestaurantId;
    }

    public UUID getUploadedByUserId() {
        return uploadedByUserId;
    }

    public String getContentType() {
        return contentType;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
