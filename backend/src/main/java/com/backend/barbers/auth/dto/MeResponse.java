package com.backend.barbers.auth.dto;

import com.backend.users.Role;
import java.util.UUID;

public record  MeResponse(
        UUID id,
        String email,
        String name,
        Role role,
        UUID tenantId
) {
}
