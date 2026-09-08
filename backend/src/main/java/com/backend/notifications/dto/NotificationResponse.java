package com.backend.notifications.dto;

import com.backend.notifications.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        NotificationType type,
        String title,
        String message,
        String referenceType,
        UUID referenceId,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {
}
