package com.pauluna.mesa.group.infrastructure;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.group.domain.GroupMember;

public interface GroupMemberRepository
        extends JpaRepository<GroupMember, UUID> {

    boolean existsByGroupIdAndUserId(
            UUID groupId,
            UUID userId
    );
}