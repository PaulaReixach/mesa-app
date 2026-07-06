package com.pauluna.mesa.group.infrastructure;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.group.domain.GroupFollower;

public interface GroupFollowerRepository
        extends JpaRepository<GroupFollower, UUID> {

    Optional<GroupFollower> findByGroupIdAndUserId(
            UUID groupId,
            UUID userId
    );

    boolean existsByGroupIdAndUserId(
            UUID groupId,
            UUID userId
    );

    long countByGroupId(UUID groupId);

    long deleteByGroupIdAndUserId(
            UUID groupId,
            UUID userId
    );
}
