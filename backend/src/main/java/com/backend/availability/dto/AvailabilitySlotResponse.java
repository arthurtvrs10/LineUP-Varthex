package com.backend.availability.dto;

import java.time.LocalDateTime;

public record AvailabilitySlotResponse(
        LocalDateTime startAt,
        LocalDateTime endAt
) {
}
