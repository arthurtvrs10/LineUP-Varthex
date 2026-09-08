package com.backend.scheduling.dto;

import java.util.UUID;

public record AppointmentItemResponse(
        UUID id,
        UUID serviceId,
        String name,
        int durationMinutes,
        String unitPrice,
        String discountAmount
) {
}
