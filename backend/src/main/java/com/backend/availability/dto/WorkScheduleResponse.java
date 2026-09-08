package com.backend.availability.dto;

import java.time.LocalTime;
import java.util.UUID;

public record WorkScheduleResponse(
        UUID id,
        int weekday,
        LocalTime startTime,
        LocalTime endTime
) {
}
