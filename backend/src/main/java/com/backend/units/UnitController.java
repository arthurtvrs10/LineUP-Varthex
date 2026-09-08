package com.backend.units;

import com.backend.units.dto.UnitInputRequest;
import com.backend.units.dto.UnitResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
public class UnitController {

    private final UnitService unitService;

    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @GetMapping("/unit")
    public UnitResponse getCurrentUnit(JwtAuthenticationToken authentication) {
        return unitService.getCurrentUnit(currentTenantId(authentication));
    }

    @PatchMapping("/unit")
    public UnitResponse updateCurrentUnit(
            @RequestBody UnitInputRequest request,
            JwtAuthenticationToken authentication
    ) {
        return unitService.updateCurrentUnit(currentTenantId(authentication), request);
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
