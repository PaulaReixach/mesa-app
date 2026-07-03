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
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class AppNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "user_id",
            nullable = false
    )
    private UUID userId;

    @Column(name = "actor_user_id")
    private UUID actorUserId;

    @Column(
            name = "actor_name",
            length = 100
    )
    private String actorName;

    @Column(
            name = "actor_avatar_url",
            length = 500
    )
    private String actorAvatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "type",
            nullable = false,
            length = 50
    )
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "category",
            nullable = false,
            length = 20
    )
    private NotificationCategory category;

    @Column(
            name = "title",
            nullable = false,
            length = 160
    )
    private String title;

    @Column(
            name = "message",
            nullable = false,
            length = 500
    )
    private String message;

    @Column(
            name = "target_url",
            length = 500
    )
    private String targetUrl;

    @Column(
            name = "is_read",
            nullable = false
    )
    private boolean read;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    protected AppNotification() {
        // Constructor requerido por JPA.
    }

    public AppNotification(
            UUID userId,
            UUID actorUserId,
            String actorName,
            String actorAvatarUrl,
            NotificationType type,
            String title,
            String message,
            String targetUrl
    ) {
        this.userId = userId;
        this.actorUserId = actorUserId;
        this.actorName = actorName;
        this.actorAvatarUrl = actorAvatarUrl;
        this.type = type;
        this.category = type.getCategory();
        this.title = title;
        this.message = message;
        this.targetUrl = targetUrl;
        this.read = false;
    }

    public void markAsRead() {
        if (read) {
            return;
        }

        this.read = true;
        this.readAt = Instant.now();
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getActorUserId() {
        return actorUserId;
    }

    public String getActorName() {
        return actorName;
    }

    public String getActorAvatarUrl() {
        return actorAvatarUrl;
    }

    public NotificationType getType() {
        return type;
    }

    public NotificationCategory getCategory() {
        return category;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getTargetUrl() {
        return targetUrl;
    }

    public boolean isRead() {
        return read;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}