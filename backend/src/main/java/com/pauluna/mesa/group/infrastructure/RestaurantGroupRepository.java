package com.pauluna.mesa.group.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.RestaurantGroup;

public interface RestaurantGroupRepository
        extends JpaRepository<RestaurantGroup, UUID> {

    @Query("""
            SELECT restaurantGroup
            FROM RestaurantGroup restaurantGroup
            WHERE EXISTS (
                SELECT groupMember.id
                FROM GroupMember groupMember
                WHERE groupMember.groupId = restaurantGroup.id
                  AND groupMember.userId = :userId
            )
            ORDER BY restaurantGroup.createdAt DESC
            """)
    List<RestaurantGroup> findAllByMemberUserId(
            @Param("userId") UUID userId
    );

    List<RestaurantGroup> findAllByPrivacyOrderByUpdatedAtDesc(
            GroupPrivacy privacy
    );

    List<RestaurantGroup> findAllByOwnerUserId(
            UUID ownerUserId
    );

    long deleteAllByOwnerUserId(
            UUID ownerUserId
    );
}
