package com.backend.units.dto;

public record UnitInputRequest(
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
        boolean active
) {
}
