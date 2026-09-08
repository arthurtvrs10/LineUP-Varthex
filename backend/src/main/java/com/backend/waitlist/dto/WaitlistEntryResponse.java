package com.backend.waitlist.dto;

import com.backend.waitlist.WaitlistStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record WaitlistEntryResponse(
        UUID id,
        UUID unitId,
        UUID customerId,
        String customerName,
        UUID serviceId,
        String serviceName,
        UUID preferredBarberId,
        String preferredBarberName,
        LocalDateTime windowStartAt,
        LocalDateTime windowEndAt,
        WaitlistStatus status,
        String notes,
        LocalDateTime createdAt
) {
}
