package com.backend.barbers.auth.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record SessionResponse(
        UUID id,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        String userAgent
) {
}
