package com.backend.scheduling.dto;

import com.backend.scheduling.AppointmentChannel;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record AppointmentCreateRequest(
        UUID unitId,
        UUID customerId,
        UUID barberId,
        LocalDateTime startAt,
        List<AppointmentItemInputRequest> items,
        AppointmentChannel channel,
        String notes
) {
}
