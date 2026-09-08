package com.backend.availability.dto;

import com.backend.availability.AvailabilityExceptionType;

import java.time.LocalDateTime;
import java.util.UUID;

public record AvailabilityExceptionResponse(
        UUID id,
        AvailabilityExceptionType type,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        String reason
) {
}
