package com.backend.barbers.dto;

public record UpdateBarberRequest(
        String displayName,
        String bio,
        Integer defaultCommissionPercent
) {

}
