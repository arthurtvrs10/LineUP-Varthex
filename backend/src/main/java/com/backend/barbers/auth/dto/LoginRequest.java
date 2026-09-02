package com.backend.barbers.auth.dto;

public record LoginRequest(
        String email,
        String password
) { }
