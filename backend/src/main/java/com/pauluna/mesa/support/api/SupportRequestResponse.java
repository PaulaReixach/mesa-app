package com.pauluna.mesa.support.api;

import java.time.Instant;
import java.util.UUID;

import com.pauluna.mesa.support.domain.SupportRequest;
import com.pauluna.mesa.support.domain.SupportRequestCategory;
import com.pauluna.mesa.support.domain.SupportRequestStatus;

public record SupportRequestResponse(

        UUID id,
        SupportRequestCategory category,
        String subject,
        SupportRequestStatus status,
        Instant createdAt

) {

    public static SupportRequestResponse from(
            SupportRequest supportRequest
    ) {
        return new SupportRequestResponse(
                supportRequest.getId(),
                supportRequest.getCategory(),
                supportRequest.getSubject(),
                supportRequest.getStatus(),
                supportRequest.getCreatedAt()
        );
    }
}