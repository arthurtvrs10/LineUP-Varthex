package com.backend.users.dto;

import com.backend.users.Role;

import java.util.UUID;

public record CreateUserRequest (
        String name,
        String email,
        String passwordHash,
        Role role,
        UUID barbershopId
){}