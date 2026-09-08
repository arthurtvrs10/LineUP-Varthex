package com.backend.commissions.dto;

import java.time.LocalDate;

public record CommissionSummaryResponse(
        LocalDate from,
        LocalDate to,
        String provisionedAmount,
        String approvedAmount,
        String paidAmount
) {
}
