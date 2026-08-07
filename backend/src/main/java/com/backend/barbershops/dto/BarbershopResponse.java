package com.backend.barbershops.dto;

import com.backend.barbershops.BarbershopStatus;
import com.backend.barbershops.BusinessDocumentType;

import java.time.LocalDateTime;
import java.util.UUID;

public record BarbershopResponse(
        UUID id,
        String name,
        BusinessDocumentType documentType,
        String documentNumber,
        String phone,
        String email,
        BarbershopStatus status,
        String timezone,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
