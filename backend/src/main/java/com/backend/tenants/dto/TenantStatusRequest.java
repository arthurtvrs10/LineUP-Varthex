package com.backend.tenants.dto;

import com.backend.tenants.TenantStatus;

public record TenantStatusRequest(
        TenantStatus status
) {
}
