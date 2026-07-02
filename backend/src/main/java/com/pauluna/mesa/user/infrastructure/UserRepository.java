package com.pauluna.mesa.user.infrastructure;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.user.domain.User;

public interface UserRepository
        extends JpaRepository<User, UUID> {

    boolean existsByUsernameIgnoreCase(
            String username
    );

    boolean existsByEmailIgnoreCase(
            String email
    );

    boolean existsByUsernameIgnoreCaseAndIdNot(
            String username,
            UUID id
    );

    boolean existsByEmailIgnoreCaseAndIdNot(
            String email,
            UUID id
    );

    Optional<User> findByUsernameIgnoreCase(
            String username
    );

    Optional<User> findByEmailIgnoreCase(
            String email
    );
}