package com.backend.availability.dto;

import com.backend.availability.AvailabilityExceptionType;

import java.time.LocalDateTime;

public record AvailabilityExceptionRequest(
        AvailabilityExceptionType type,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        String reason
) {
}
