package com.backend.users.dto;

// photoData: data URL base64 da nova foto; null = não mexe na foto atual,
// string vazia = remove a foto atual.
public record UpdateOwnProfileRequest(
        String name,
        String photoData
) {
}
