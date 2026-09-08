package com.backend.units.dto;

import java.util.UUID;

public record UnitResponse(
        UUID id,
        String name,
        String document,
        String email,
        String phone,
        String street,
        String number,
        String complement,
        String district,
        String city,
        String state,
        String country,
        String timeZone,
        boolean active,
        Long version
) {
}
