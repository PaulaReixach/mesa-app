package com.pauluna.mesa.user.application;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.user.api.UserSearchResponse;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional(readOnly = true)
public class UserSearchService {

    private static final int MINIMUM_QUERY_LENGTH = 2;
    private static final int MAXIMUM_RESULTS = 8;

    private final UserRepository userRepository;

    public UserSearchService(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    public List<UserSearchResponse> searchInvitableUsers(
            UUID currentUserId,
            String query
    ) {
        String normalizedQuery = query == null
                ? ""
                : query.trim().toLowerCase(Locale.ROOT);

        if (normalizedQuery.length() < MINIMUM_QUERY_LENGTH) {
            return List.of();
        }

        return userRepository
                .searchInvitableUsers(
                        currentUserId,
                        normalizedQuery,
                        PageRequest.of(
                                0,
                                MAXIMUM_RESULTS
                        )
                )
                .stream()
                .map(UserSearchResponse::from)
                .toList();
    }
}
