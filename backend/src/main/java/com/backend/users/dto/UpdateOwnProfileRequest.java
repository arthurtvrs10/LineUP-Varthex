package com.backend.users.dto;

// photoData: JPEG base64 para upload privado; URL atual = preservar; null = não mexer,
// string vazia = remove a foto atual.
public record UpdateOwnProfileRequest(
        String name,
        String photoData
) {
}
