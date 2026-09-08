package com.backend.services.dto;

import com.backend.services.ServiceType;

import java.util.UUID;

public record ServiceRequest(
        UUID unitId,
        UUID categoryId,
        ServiceType serviceType,
        String name,
        String description,
        Integer durationMinutes,
        Integer bufferBeforeMinutes,
        Integer bufferAfterMinutes,
        String price,
        Integer sortOrder,
        Boolean active,
        Long version
) {
}
