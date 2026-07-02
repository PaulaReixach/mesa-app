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
@Table(name = "user_avatars")
public class UserAvatar {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(
            name = "content_type",
            nullable = false,
            length = 100
    )
    private String contentType;

    @Column(
            name = "image_data",
            nullable = false,
            columnDefinition = "bytea"
    )
    private byte[] imageData;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    protected UserAvatar() {
        // Constructor requerido por JPA.
    }

    public UserAvatar(
            UUID userId,
            String contentType,
            byte[] imageData
    ) {
        this.userId = userId;
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

    public UUID getUserId() {
        return userId;
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