package com.backend.customers.dto;

import com.backend.customers.CustomerStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record CustomerResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        LocalDate birthDate,
        String notes,
        Long version,
        CustomerStatus status,
        LocalDateTime createdAt
) {
}
