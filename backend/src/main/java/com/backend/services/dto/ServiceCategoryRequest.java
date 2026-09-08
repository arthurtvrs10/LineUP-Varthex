package com.backend.services.dto;

public record ServiceCategoryRequest(
        String name,
        Integer sortOrder,
        Boolean active,
        Long version
) {
}
