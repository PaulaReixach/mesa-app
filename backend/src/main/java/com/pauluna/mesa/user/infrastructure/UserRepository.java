package com.pauluna.mesa.user.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
            SELECT candidate
            FROM User candidate
            WHERE candidate.id <> :excludedUserId
              AND (
                  LOWER(candidate.username) LIKE CONCAT(CONCAT('%', :query), '%')
                  OR LOWER(candidate.name) LIKE CONCAT(CONCAT('%', :query), '%')
              )
              AND NOT EXISTS (
                  SELECT preferences.userId
                  FROM UserPrivacyPreferences preferences
                  WHERE preferences.userId = candidate.id
                    AND preferences.groupInvitationsEnabled = false
              )
            ORDER BY
              CASE
                  WHEN LOWER(candidate.username) = :query THEN 0
                  WHEN LOWER(candidate.username) LIKE CONCAT(:query, '%') THEN 1
                  ELSE 2
              END,
              LOWER(candidate.username)
            """)
    List<User> searchInvitableUsers(
            @Param("excludedUserId")
            UUID excludedUserId,
            @Param("query")
            String query,
            Pageable pageable
    );
}
