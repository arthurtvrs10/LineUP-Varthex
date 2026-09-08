package com.backend.notifications.dto;

import com.backend.notifications.NotificationType;

public record UpdateNotificationPreferenceRequest(
        NotificationType type,
        boolean emailEnabled
) {
}
