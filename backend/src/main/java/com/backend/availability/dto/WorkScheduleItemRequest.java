package com.backend.availability.dto;

import java.time.LocalTime;

public record WorkScheduleItemRequest(
        int weekday,
        LocalTime startTime,
        LocalTime endTime
) {
}
