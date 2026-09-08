package com.backend.commissions.dto;

import com.backend.commissions.CommissionType;

import java.time.LocalDateTime;
import java.util.UUID;

public record CommissionRuleRequest(
        UUID barberId,
        UUID serviceId,
        CommissionType type,
        String percentage,
        String fixedAmount,
        LocalDateTime validFrom,
        LocalDateTime validTo,
        Long version
) {
}
