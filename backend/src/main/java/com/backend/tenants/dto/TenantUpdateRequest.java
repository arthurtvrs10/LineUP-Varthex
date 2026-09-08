package com.backend.tenants.dto;

public record TenantUpdateRequest(
        String tradeName,
        String legalName,
        String document,
        String defaultTimeZone,
        String locale,
        String currency,
        String email,
        String phone,
        Long version
) {
}
