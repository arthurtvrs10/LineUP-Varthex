package com.backend.scheduling.dto;

import com.backend.scheduling.AppointmentChannel;
import com.backend.scheduling.AppointmentStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID unitId,
        UUID customerId,
        UUID barberId,
        AppointmentStatus status,
        AppointmentChannel channel,
        LocalDateTime startAt,
        LocalDateTime endAt,
        String totalAmount,
        String discountAmount,
        String surchargeAmount,
        String tipAmount,
        String notes,
        List<AppointmentItemResponse> items,
        String cancellationReason,
        LocalDateTime canceledAt,
        LocalDateTime completedAt,
        Long version
) {
}
