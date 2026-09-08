package com.backend.scheduling.dto;

public record AppointmentActionRequest(
        String reason,
        Long version
) {
}
