package com.pauluna.mesa.group.infrastructure;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.group.domain.GroupImage;

public interface GroupImageRepository
        extends JpaRepository<GroupImage, UUID> {
}