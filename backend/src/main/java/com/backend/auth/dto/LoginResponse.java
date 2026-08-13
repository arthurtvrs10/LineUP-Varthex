package com.backend.auth.dto;

import com.backend.users.Role;

import java.util.UUID;

public record LoginResponse(
        UUID id,
        String email,
        Role role,
        String accessToken,
        String tokenType,
        String message
) {
}
