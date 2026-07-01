package com.pauluna.mesa.auth.application;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.auth.api.AuthResponse;
import com.pauluna.mesa.auth.api.LoginRequest;
import com.pauluna.mesa.auth.api.RegisterRequest;
import com.pauluna.mesa.user.api.CreateUserRequest;
import com.pauluna.mesa.user.api.UserResponse;
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.application.UserService;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthService(
            UserService userService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    public AuthResponse register(RegisterRequest request) {
        CreateUserRequest createUserRequest = new CreateUserRequest(
                request.name(),
                request.username(),
                request.email(),
                request.password(),
                request.avatarUrl()
        );

        UserResponse createdUser = userService.createUser(
                createUserRequest
        );

        User user = userRepository
                .findById(createdUser.id())
                .orElseThrow(() ->
                        new UserNotFoundException(createdUser.id())
                );

        return createAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.identifier()
                .trim()
                .toLowerCase(Locale.ROOT);

        User user = userRepository
                .findByEmailIgnoreCase(identifier)
                .or(() -> userRepository
                        .findByUsernameIgnoreCase(identifier)
                )
                .orElseThrow(InvalidCredentialsException::new);

        boolean passwordMatches = passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        );

        if (!passwordMatches) {
            throw new InvalidCredentialsException();
        }

        return createAuthResponse(user);
    }

    private AuthResponse createAuthResponse(User user) {
        IssuedToken issuedToken = jwtTokenService.issueToken(user);

        return new AuthResponse(
                issuedToken.value(),
                "Bearer",
                issuedToken.expiresAt(),
                UserResponse.from(user)
        );
    }
}