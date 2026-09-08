package com.backend.tenants.dto;

import com.backend.units.dto.UnitInputRequest;

public record TenantCreateRequest(
        String tradeName,
        String legalName,
        String document,
        String defaultTimeZone,
        String locale,
        String currency,
        UserInviteRequest admin,
        UnitInputRequest initialUnit
) {
}
