package com.backend.barbers.auth.dto;

public record ChangePasswordRequest(
        String currentPassword,
        String newPassword
) {
}
