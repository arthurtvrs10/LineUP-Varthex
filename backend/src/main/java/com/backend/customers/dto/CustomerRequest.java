package com.backend.customers.dto;

import java.time.LocalDate;

public record CustomerRequest(
        String fullName,
        String email,
        String phone,
        LocalDate birthDate,
        String notes,
        Long version
) {
}
