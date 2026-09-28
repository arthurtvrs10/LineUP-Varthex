package com.backend.customers;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;

public final class ClientTenant {
    private ClientTenant() {}
    public static UUID id(JwtAuthenticationToken authentication) {
        String id = authentication.getToken().getClaimAsString("tenantId");
        if (id == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escolha uma barbearia para continuar");
        return UUID.fromString(id);
    }
}
