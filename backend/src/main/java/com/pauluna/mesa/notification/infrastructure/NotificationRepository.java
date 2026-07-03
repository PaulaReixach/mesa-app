package com.pauluna.mesa.notification.infrastructure;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pauluna.mesa.notification.domain.AppNotification;
import com.pauluna.mesa.notification.domain.NotificationCategory;

public interface NotificationRepository
        extends JpaRepository<AppNotification, UUID> {

    Page<AppNotification>
    findAllByUserIdOrderByCreatedAtDesc(
            UUID userId,
            Pageable pageable
    );

    Page<AppNotification>
    findAllByUserIdAndCategoryOrderByCreatedAtDesc(
            UUID userId,
            NotificationCategory category,
            Pageable pageable
    );

    Optional<AppNotification> findByIdAndUserId(
            UUID id,
            UUID userId
    );

    long countByUserIdAndReadFalse(
            UUID userId
    );

    @Modifying
    @Query("""
            UPDATE AppNotification notification
            SET notification.read = true,
                notification.readAt = :readAt
            WHERE notification.userId = :userId
              AND notification.read = false
            """)
    int markAllAsRead(
            @Param("userId") UUID userId,
            @Param("readAt") Instant readAt
    );
}