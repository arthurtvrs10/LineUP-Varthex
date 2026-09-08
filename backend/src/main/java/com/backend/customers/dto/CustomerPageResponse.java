package com.backend.customers.dto;

import java.util.List;

public record CustomerPageResponse(
        List<CustomerResponse> items,
        PageMetaResponse page
) {
}
