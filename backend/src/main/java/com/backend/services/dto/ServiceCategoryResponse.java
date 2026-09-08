package com.backend.services.dto;

import java.util.UUID;

public record ServiceCategoryResponse(
        UUID id,
        String name,
        int sortOrder,
        boolean active,
        Long version
) {
}
