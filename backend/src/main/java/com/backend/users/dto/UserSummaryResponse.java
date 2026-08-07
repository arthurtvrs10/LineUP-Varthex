package com.backend.users.dto;

import com.backend.users.Role;
import com.backend.users.UserStatus;

import java.util.UUID;

public record UserSummaryResponse(
        UUID id,
        String name,
        String email,
        Role role,
        UserStatus status
) {
}