package com.backend.waitlist.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record WaitlistEntryRequest(
        UUID unitId,
        UUID customerId,
        UUID serviceId,
        UUID preferredBarberId,
        LocalDateTime windowStartAt,
        LocalDateTime windowEndAt,
        String notes
) {
}
