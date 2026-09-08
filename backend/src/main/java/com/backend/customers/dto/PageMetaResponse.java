package com.backend.customers.dto;

public record PageMetaResponse(
        int number,
        int size,
        long totalElements,
        int totalPages
) {
}
