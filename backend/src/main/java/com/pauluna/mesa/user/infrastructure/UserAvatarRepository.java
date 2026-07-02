package com.pauluna.mesa.user.infrastructure;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pauluna.mesa.user.domain.UserAvatar;

public interface UserAvatarRepository
        extends JpaRepository<UserAvatar, UUID> {
}