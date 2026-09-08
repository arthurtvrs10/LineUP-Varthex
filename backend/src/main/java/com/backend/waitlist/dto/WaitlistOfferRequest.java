package com.backend.waitlist.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record WaitlistOfferRequest(
        UUID barberId,
        LocalDateTime slotStartAt,
        LocalDateTime slotEndAt
) {
}
