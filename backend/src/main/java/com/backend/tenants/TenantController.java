package com.backend.tenants;

import com.backend.tenants.dto.TenantCreateRequest;
import com.backend.tenants.dto.TenantResponse;
import com.backend.tenants.dto.TenantUpdateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @PostMapping("/tenants")
    @ResponseStatus(HttpStatus.CREATED)
    public TenantResponse createTenant(@RequestBody TenantCreateRequest request) {
        return tenantService.createTenant(request);
    }

    @GetMapping("/tenant")
    public TenantResponse getCurrentTenant(JwtAuthenticationToken authentication) {
        return tenantService.getCurrentTenant(currentTenantId(authentication));
    }

    @PatchMapping("/tenant")
    public TenantResponse updateCurrentTenant(
            @RequestBody TenantUpdateRequest request,
            JwtAuthenticationToken authentication
    ) {
        return tenantService.updateCurrentTenant(currentTenantId(authentication), request);
    }

    private UUID currentTenantId(JwtAuthenticationToken authentication) {
        String claim = authentication.getToken().getClaimAsString("tenantId");

        if (claim == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Usuário autenticado não está vinculado a nenhuma barbearia"
            );
        }

        return UUID.fromString(claim);
    }
}
