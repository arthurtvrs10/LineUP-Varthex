package com.backend.users.dto;

import com.backend.users.Role;
import com.backend.users.UserStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse (
        UUID id,
        String name,
        String email,
        Role role,
        UserStatus UserStatus,
        UUID barbershopId,
        LocalDateTime createdAt
) {

}
