package com.backend.barbers.dto;

import com.backend.barbers.BarberStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record BarberResponse(
        UUID id,
        UUID userId,
        UUID unitId,
        String displayName,
        String bio,
        int defaultCommissionPercent,
        BarberStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String photoData
) {
}
