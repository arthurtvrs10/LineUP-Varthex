package com.backend.barbershops.dto;

import com.backend.barbershops.BarbershopStatus;

import java.util.UUID;

public record BarbershopSummaryResponse(
        UUID id,
        String name,
        String email,
        String phone,
        BarbershopStatus status
) {
}