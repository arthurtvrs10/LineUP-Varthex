package com.backend.commissions.dto;

import java.util.UUID;

public record CommissionAdjustmentRequest(
        UUID barberId,
        UUID appointmentId,
        String amount,
        String reason
) {
}
