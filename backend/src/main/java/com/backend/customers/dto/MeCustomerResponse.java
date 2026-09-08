package com.backend.customers.dto;

import com.backend.customers.CustomerStatus;

import java.util.UUID;

public record MeCustomerResponse(
        UUID customerId,
        UUID tenantId,
        String tenantName,
        String fullName,
        String email,
        String phone,
        CustomerStatus status
) {
}
