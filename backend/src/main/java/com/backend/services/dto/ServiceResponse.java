package com.backend.services.dto;

import com.backend.services.ServiceType;

import java.util.UUID;

public record ServiceResponse(
        UUID id,
        UUID unitId,
        UUID categoryId,
        ServiceType serviceType,
        String name,
        String description,
        int durationMinutes,
        int bufferBeforeMinutes,
        int bufferAfterMinutes,
        String price,
        int sortOrder,
        boolean active,
        Long version
) {
}
