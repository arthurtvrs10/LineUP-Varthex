package com.backend.waitlist.dto;

import com.backend.waitlist.WaitlistOfferStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record WaitlistOfferResponse(
        UUID id,
        UUID waitlistEntryId,
        UUID barberId,
        String barberName,
        LocalDateTime slotStartAt,
        LocalDateTime slotEndAt,
        WaitlistOfferStatus status,
        LocalDateTime expiresAt,
        LocalDateTime createdAt
) {
}
