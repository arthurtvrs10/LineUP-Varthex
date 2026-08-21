package com.backend.barbers.dto;

import com.backend.barbers.BarberStatus;

public record UpdateBarberStatusRequest(
        BarberStatus status
) {
}
