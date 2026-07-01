package com.pauluna.mesa.restaurant.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "restaurant_ratings",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_restaurant_ratings_restaurant_user",
                        columnNames = {
                                "group_restaurant_id",
                                "user_id"
                        }
                )
        }
)
public class RestaurantRating {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "group_restaurant_id",
            nullable = false
    )
    private UUID groupRestaurantId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "score", nullable = false)
    private int score;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected RestaurantRating() {
        // Constructor requerido por JPA.
    }

    public RestaurantRating(
            UUID groupRestaurantId,
            UUID userId,
            int score
    ) {
        this.groupRestaurantId = groupRestaurantId;
        this.userId = userId;
        this.score = score;
    }

    public void changeScore(int score) {
        this.score = score;
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

    public UUID getGroupRestaurantId() {
        return groupRestaurantId;
    }

    public UUID getUserId() {
        return userId;
    }

    public int getScore() {
        return score;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}