package com.pauluna.mesa.support.api;

import com.pauluna.mesa.support.domain.SupportRequestCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateSupportRequestRequest(

        @NotNull
        SupportRequestCategory category,

        @NotBlank
        @Size(max = 120)
        String subject,

        @NotBlank
        @Size(
                min = 10,
                max = 1500
        )
        String message

) {
}