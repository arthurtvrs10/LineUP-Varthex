package com.projeto20h.users.dto;

import com.projeto20h.users.Role;

import java.util.UUID;

public record CreateUserRequest (
        String name,
        String email,
        String passwordHash,
        Role role,
        UUID barbershopId
){}