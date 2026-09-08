package com.backend.dashboard.dto;

public record DashboardOverviewResponse(
        int scheduled,
        int completed,
        int canceled,
        int noShow,
        String grossAmount,
        String commissionAmount
) {
}
