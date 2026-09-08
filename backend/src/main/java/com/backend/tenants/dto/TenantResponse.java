package com.backend.tenants.dto;

import com.backend.tenants.TenantStatus;

import java.util.UUID;

public record TenantResponse(
        UUID id,
        String tradeName,
        String legalName,
        String document,
        TenantStatus status,
        String defaultTimeZone,
        String locale,
        String currency,
        String email,
        String phone,
        String logoUrl,
        String slug,
        Long version
) {
}
