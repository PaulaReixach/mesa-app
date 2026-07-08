package com.pauluna.mesa.group.domain;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "group_activity_events")
public class GroupActivityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    private UUID groupId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 40)
    private GroupActivityType type;

    @Column(name = "actor_user_id")
    private UUID actorUserId;

    @Column(name = "actor_name", length = 100)
    private String actorName;

    @Column(name = "actor_avatar_url", length = 500)
    private String actorAvatarUrl;

    @Column(name = "subject_user_id")
    private UUID subjectUserId;

    @Column(name = "subject_name", length = 100)
    private String subjectName;

    @Column(name = "subject_avatar_url", length = 500)
    private String subjectAvatarUrl;

    @Column(name = "restaurant_name", length = 200)
    private String restaurantName;

    @Column(name = "score")
    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(name = "restaurant_status", length = 30)
    private GroupRestaurantStatus restaurantStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected GroupActivityEvent() {
        // Constructor requerido por JPA.
    }

    public Long getId() {
        return id;
    }

    public UUID getGroupId() {
        return groupId;
    }

    public GroupActivityType getType() {
        return type;
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

    public UUID getSubjectUserId() {
        return subjectUserId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public String getSubjectAvatarUrl() {
        return subjectAvatarUrl;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public Integer getScore() {
        return score;
    }

    public GroupRestaurantStatus getRestaurantStatus() {
        return restaurantStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
