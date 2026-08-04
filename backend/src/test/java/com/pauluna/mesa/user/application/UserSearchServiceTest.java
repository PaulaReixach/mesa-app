package com.pauluna.mesa.user.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import com.pauluna.mesa.user.api.UserSearchResponse;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserSearchServiceTest {

    private static final UUID CURRENT_USER_ID =
            UUID.randomUUID();

    @Mock
    private UserRepository userRepository;

    private UserSearchService service;

    @BeforeEach
    void setUp() {
        service = new UserSearchService(
                userRepository
        );
    }

    @Test
    void shortQueryReturnsNoResults() {
        List<UserSearchResponse> result =
                service.searchInvitableUsers(
                        CURRENT_USER_ID,
                        "a"
                );

        assertEquals(List.of(), result);
        verify(userRepository, never())
                .searchInvitableUsers(
                        any(UUID.class),
                        any(String.class),
                        any(Pageable.class)
                );
    }

    @Test
    void searchNormalizesQueryAndMapsSafeFields() {
        User user = new User(
                "Ana García",
                "ana",
                "ana@example.com",
                "password-hash",
                "/users/avatar"
        );

        when(userRepository.searchInvitableUsers(
                any(UUID.class),
                any(String.class),
                any(Pageable.class)
        )).thenReturn(List.of(user));

        List<UserSearchResponse> result =
                service.searchInvitableUsers(
                        CURRENT_USER_ID,
                        "  ANA  "
                );

        assertEquals(1, result.size());
        assertEquals("Ana García", result.getFirst().name());
        assertEquals("ana", result.getFirst().username());
        assertEquals("/users/avatar", result.getFirst().avatarUrl());
        verify(userRepository).searchInvitableUsers(
                CURRENT_USER_ID,
                "ana",
                Pageable.ofSize(8)
        );
    }
}
