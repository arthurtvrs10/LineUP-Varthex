package com.backend.barbers.auth.dto;

public record PasswordRecoveryCompleteRequest(
        String token,
        String newPassword
) {
}
