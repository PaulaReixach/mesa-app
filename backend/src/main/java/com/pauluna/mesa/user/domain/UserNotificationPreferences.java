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
@Table(name = "user_notification_preferences")
public class UserNotificationPreferences {

    @Id
    @Column(
            name = "user_id",
            nullable = false
    )
    private UUID userId;

    @Column(
            name = "notifications_enabled",
            nullable = false
    )
    private boolean notificationsEnabled;

    @Column(
            name = "new_restaurants_enabled",
            nullable = false
    )
    private boolean newRestaurantsEnabled;

    @Column(
            name = "restaurant_status_enabled",
            nullable = false
    )
    private boolean restaurantStatusEnabled;

    @Column(
            name = "ratings_enabled",
            nullable = false
    )
    private boolean ratingsEnabled;

    @Column(
            name = "group_activity_enabled",
            nullable = false
    )
    private boolean groupActivityEnabled;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    protected UserNotificationPreferences() {
        // Constructor requerido por JPA.
    }

    public UserNotificationPreferences(
            UUID userId
    ) {
        this.userId = userId;
        this.notificationsEnabled = true;
        this.newRestaurantsEnabled = true;
        this.restaurantStatusEnabled = true;
        this.ratingsEnabled = true;
        this.groupActivityEnabled = true;
    }

    public void update(
            boolean notificationsEnabled,
            boolean newRestaurantsEnabled,
            boolean restaurantStatusEnabled,
            boolean ratingsEnabled,
            boolean groupActivityEnabled
    ) {
        this.notificationsEnabled =
                notificationsEnabled;

        this.newRestaurantsEnabled =
                newRestaurantsEnabled;

        this.restaurantStatusEnabled =
                restaurantStatusEnabled;

        this.ratingsEnabled =
                ratingsEnabled;

        this.groupActivityEnabled =
                groupActivityEnabled;
    }

    @PrePersist
    @PreUpdate
    void updateTimestamp() {
        this.updatedAt = Instant.now();
    }

    public UUID getUserId() {
        return userId;
    }

    public boolean isNotificationsEnabled() {
        return notificationsEnabled;
    }

    public boolean isNewRestaurantsEnabled() {
        return newRestaurantsEnabled;
    }

    public boolean isRestaurantStatusEnabled() {
        return restaurantStatusEnabled;
    }

    public boolean isRatingsEnabled() {
        return ratingsEnabled;
    }

    public boolean isGroupActivityEnabled() {
        return groupActivityEnabled;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}