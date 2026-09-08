package com.backend.services;

import com.backend.services.dto.ServiceRequest;
import com.backend.services.dto.ServiceResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/services")
public class ServiceOfferingController {

    private final ServiceOfferingService serviceOfferingService;

    public ServiceOfferingController(ServiceOfferingService serviceOfferingService) {
        this.serviceOfferingService = serviceOfferingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceResponse createService(
            @RequestBody ServiceRequest request,
            JwtAuthenticationToken authentication
    ) {
        return serviceOfferingService.createService(currentTenantId(authentication), request);
    }

    @GetMapping
    public List<ServiceResponse> getServices(
            @RequestParam(required = false) Boolean active,
            JwtAuthenticationToken authentication
    ) {
        return serviceOfferingService.listServices(currentTenantId(authentication), active);
    }

    @PatchMapping("/{serviceId}")
    public ServiceResponse updateService(
            @PathVariable UUID serviceId,
            @RequestBody ServiceRequest request,
            JwtAuthenticationToken authentication
    ) {
        return serviceOfferingService.updateService(currentTenantId(authentication), serviceId, request);
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
