package com.pauluna.mesa.auth.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pauluna.mesa.auth.api.AccountLookupResponse;
import com.pauluna.mesa.auth.api.UsernameAvailabilityResponse;
import com.pauluna.mesa.user.application.UserService;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceLookupTest {

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenService jwtTokenService;

    private AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(userService, userRepository, passwordEncoder, jwtTokenService);
    }

    @Test
    void lookupFindsAccountByEmailAndRevealsOnlyTheName() {
        User user = mock(User.class);
        when(user.getName()).thenReturn("Paula");
        when(userRepository.findByEmailIgnoreCase("paula@mesa.app")).thenReturn(Optional.of(user));

        AccountLookupResponse response = service.lookup("  Paula@Mesa.app ");

        assertTrue(response.exists());
        assertEquals("Paula", response.name());
    }

    @Test
    void lookupFallsBackToUsername() {
        User user = mock(User.class);
        when(user.getName()).thenReturn("Ana");
        when(userRepository.findByEmailIgnoreCase("ana")).thenReturn(Optional.empty());
        when(userRepository.findByUsernameIgnoreCase("ana")).thenReturn(Optional.of(user));

        assertTrue(service.lookup("ana").exists());
    }

    @Test
    void lookupReturnsNotFoundForUnknownOrBlankIdentifier() {
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByUsernameIgnoreCase(anyString())).thenReturn(Optional.empty());

        AccountLookupResponse response = service.lookup("nadie@mesa.app");

        assertFalse(response.exists());
        assertNull(response.name());
        assertFalse(service.lookup("   ").exists());
    }

    @Test
    void freeUsernameIsAvailable() {
        when(userRepository.existsByUsernameIgnoreCase("paula")).thenReturn(false);

        UsernameAvailabilityResponse response = service.usernameAvailability("Paula");

        assertTrue(response.available());
        assertEquals(List.of(), response.suggestions());
    }

    @Test
    void takenUsernameSuggestsThreeFreeAlternatives() {
        when(userRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("paula")).thenReturn(true);
        when(userRepository.existsByUsernameIgnoreCase("paula1")).thenReturn(true);

        UsernameAvailabilityResponse response = service.usernameAvailability("paula");

        assertFalse(response.available());
        assertEquals(List.of("paula.2", "paula3", "paula.4"), response.suggestions());
    }

    @Test
    void tooShortUsernameIsNotAvailable() {
        assertFalse(service.usernameAvailability("p!").available());
    }
}
