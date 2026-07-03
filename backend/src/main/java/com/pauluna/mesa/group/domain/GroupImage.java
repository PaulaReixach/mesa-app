package com.pauluna.mesa.group.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "group_images")
public class GroupImage {

    @Id
    @Column(
            name = "group_id",
            nullable = false
    )
    private UUID groupId;

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

    protected GroupImage() {
        // Constructor requerido por JPA.
    }

    public GroupImage(
            UUID groupId,
            String contentType,
            byte[] imageData
    ) {
        this.groupId = groupId;
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

    public UUID getGroupId() {
        return groupId;
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