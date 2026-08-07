package com.backend.users.dto;

import com.backend.users.Role;

import java.util.UUID;

public record UpdateUserRequest(
        String name,
        String email,
        Role role,
        UUID barbershopId
) {
}