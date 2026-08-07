package com.backend.barbershops.dto;

public record UpdateBarbershopRequest(
        String name,
        String phone,
        String email,
        String timezone
) {
}