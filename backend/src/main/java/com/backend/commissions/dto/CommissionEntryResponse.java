package com.backend.commissions.dto;

import com.backend.commissions.CommissionStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record CommissionEntryResponse(
        UUID id,
        UUID barberId,
        UUID appointmentId,
        UUID appointmentItemId,
        UUID commissionRuleId,
        String baseAmount,
        String percentage,
        String fixedAmount,
        String commissionAmount,
        CommissionStatus status,
        UUID reversalOfId,
        String reason,
        LocalDateTime createdAt
) {
}
