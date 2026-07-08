package com.pauluna.mesa.group.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.group.domain.GroupActivityEvent;

public interface GroupActivityEventRepository
        extends JpaRepository<GroupActivityEvent, Long> {

    List<GroupActivityEvent> findTop50ByGroupIdOrderByCreatedAtDescIdDesc(
            UUID groupId
    );
}
