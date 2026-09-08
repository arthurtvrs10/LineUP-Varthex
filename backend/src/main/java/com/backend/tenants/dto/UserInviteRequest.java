package com.backend.tenants.dto;

import com.backend.users.Role;

public record UserInviteRequest(
        String email,
        String fullName,
        Role role
) {
}
