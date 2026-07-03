package com.pauluna.mesa.support.infrastructure;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.support.domain.SupportRequest;

public interface SupportRequestRepository
        extends JpaRepository<SupportRequest, UUID> {
}