package com.projeto20h.users.dto;

import com.projeto20h.users.Role;
import com.projeto20h.users.User;
import com.projeto20h.users.UserStatus;
import org.springframework.cglib.core.Local;

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
