package com.backend.scheduling.dto;

import java.util.UUID;

public record AppointmentItemInputRequest(
        UUID serviceId
) {
}
