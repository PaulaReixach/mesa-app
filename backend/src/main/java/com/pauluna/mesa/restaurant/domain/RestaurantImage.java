package com.pauluna.mesa.restaurant.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "restaurant_images")
public class RestaurantImage {

    @Id
    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(
            name = "image_data",
            nullable = false,
            columnDefinition = "bytea"
    )
    private byte[] imageData;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected RestaurantImage() {
        // Constructor requerido por JPA.
    }

    public RestaurantImage(
            UUID restaurantId,
            String contentType,
            byte[] imageData
    ) {
        this.restaurantId = restaurantId;
        this.contentType = contentType;
        this.imageData = imageData;
    }

    public void update(
            String contentType,
            byte[] imageData
    ) {
        this.contentType = contentType;
        this.imageData = imageData;
    }

    @PrePersist
    @PreUpdate
    void updateTimestamp() {
        this.updatedAt = Instant.now();
    }

    public UUID getRestaurantId() {
        return restaurantId;
    }

    public String getContentType() {
        return contentType;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
