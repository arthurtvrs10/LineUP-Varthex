package com.backend.tenants;

import com.backend.tenants.dto.TenantCreateRequest;
import com.backend.tenants.dto.TenantResponse;
import com.backend.tenants.dto.TenantStatusRequest;
import com.backend.tenants.dto.TenantUpdateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
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

    // Só SUPER_ADMIN — ver SecurityConfig. Lista todos os tenants da
    // plataforma, não só o do chamador (diferente de GET /tenant, singular).
    @GetMapping("/tenants")
    public List<TenantResponse> listTenants() {
        return tenantService.listTenants();
    }

    // Só SUPER_ADMIN — ver SecurityConfig. Suspender/reativar uma barbearia
    // é operação de plataforma, nunca do próprio ADMIN da barbearia.
    @PatchMapping("/tenants/{tenantId}/status")
    public TenantResponse updateStatus(
            @PathVariable UUID tenantId,
            @RequestBody TenantStatusRequest request
    ) {
        return tenantService.updateStatus(tenantId, request.status());
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
