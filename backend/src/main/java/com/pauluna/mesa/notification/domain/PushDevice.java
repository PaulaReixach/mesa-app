package com.pauluna.mesa.notification.domain;

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
@Table(name = "push_devices")
public class PushDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "user_id",
            nullable = false
    )
    private UUID userId;

    @Column(
            name = "expo_push_token",
            nullable = false,
            unique = true,
            length = 255
    )
    private String expoPushToken;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "platform",
            nullable = false,
            length = 20
    )
    private PushPlatform platform;

    @Column(
            name = "device_name",
            length = 150
    )
    private String deviceName;

    @Column(
            name = "active",
            nullable = false
    )
    private boolean active;

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

    protected PushDevice() {
        // Constructor requerido por JPA.
    }

    public PushDevice(
            UUID userId,
            String expoPushToken,
            PushPlatform platform,
            String deviceName
    ) {
        this.userId = userId;
        this.expoPushToken = expoPushToken;
        this.platform = platform;
        this.deviceName = deviceName;
        this.active = true;
    }

    public void register(
            UUID userId,
            PushPlatform platform,
            String deviceName
    ) {
        this.userId = userId;
        this.platform = platform;
        this.deviceName = deviceName;
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
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

    public UUID getUserId() {
        return userId;
    }

    public String getExpoPushToken() {
        return expoPushToken;
    }

    public PushPlatform getPlatform() {
        return platform;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public boolean isActive() {
        return active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}