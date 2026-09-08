package com.backend.notifications.dto;

import com.backend.notifications.NotificationType;

public record NotificationPreferenceResponse(
        NotificationType type,
        boolean emailEnabled,
        boolean mandatory
) {
}
