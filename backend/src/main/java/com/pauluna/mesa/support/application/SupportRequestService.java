package com.pauluna.mesa.support.application;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.support.api.CreateSupportRequestRequest;
import com.pauluna.mesa.support.api.SupportRequestResponse;
import com.pauluna.mesa.support.domain.SupportRequest;
import com.pauluna.mesa.support.infrastructure.SupportRequestRepository;
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class SupportRequestService {

    private final SupportRequestRepository
            supportRequestRepository;

    private final UserRepository userRepository;

    public SupportRequestService(
            SupportRequestRepository
                    supportRequestRepository,
            UserRepository userRepository
    ) {
        this.supportRequestRepository =
                supportRequestRepository;

        this.userRepository =
                userRepository;
    }

    public SupportRequestResponse createSupportRequest(
            UUID userId,
            CreateSupportRequestRequest request
    ) {
        validateUserExists(userId);

        SupportRequest supportRequest =
                new SupportRequest(
                        userId,
                        request.category(),
                        request.subject().trim(),
                        request.message().trim()
                );

        SupportRequest savedSupportRequest =
                supportRequestRepository
                        .saveAndFlush(
                                supportRequest
                        );

        return SupportRequestResponse.from(
                savedSupportRequest
        );
    }

    private void validateUserExists(
            UUID userId
    ) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }
    }
}