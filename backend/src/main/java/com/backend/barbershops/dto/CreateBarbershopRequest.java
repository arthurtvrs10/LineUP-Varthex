package com.backend.barbershops.dto;

import com.backend.barbershops.BusinessDocumentType;

public record CreateBarbershopRequest(
        String name,
        BusinessDocumentType documentType,
        String documentNumber,
        String phone,
        String email,
        String timezone
) {
}