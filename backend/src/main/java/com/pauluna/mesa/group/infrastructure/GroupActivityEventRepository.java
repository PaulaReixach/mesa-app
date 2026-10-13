package com.pauluna.mesa.group.infrastructure;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pauluna.mesa.group.domain.GroupActivityEvent;
import com.pauluna.mesa.group.domain.GroupActivityType;

public interface GroupActivityEventRepository
        extends JpaRepository<GroupActivityEvent, Long> {

    List<GroupActivityEvent> findTop50ByGroupIdOrderByCreatedAtDescIdDesc(
            UUID groupId
    );

    /** News by other people (or unknown actors) after the given moment. */
    @Query("""
            select count(event) from GroupActivityEvent event
            where event.groupId = :groupId
              and event.createdAt > :since
              and event.type in :types
              and (event.actorUserId is null or event.actorUserId <> :userId)
            """)
    long countUnseen(
            @Param("groupId") UUID groupId,
            @Param("since") Instant since,
            @Param("types") Collection<GroupActivityType> types,
            @Param("userId") UUID userId
    );
}
