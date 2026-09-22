package com.backend.barbers;

import com.backend.barbers.dto.BarberResponse;
import com.backend.barbers.dto.CreateBarberRequest;
import com.backend.barbers.dto.UpdateBarberRequest;
import com.backend.barbers.dto.UpdateBarberStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/barbers")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class BarberController {

    private final BarberService barberService;
    private final BarberRepository barberRepository;
    private final com.backend.units.UnitRepository unitRepository;
    private final com.backend.users.UserRepository userRepository;
    private UUID tenant(JwtAuthenticationToken auth){String id=auth.getToken().getClaimAsString("tenantId");if(id==null)throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,"Perfil sem barbearia");return UUID.fromString(id);}
    private BarberProfile scoped(UUID id,JwtAuthenticationToken auth){return barberRepository.findById(id).filter(b->tenant(auth).equals(b.getUnit().getTenant().getId())).orElseThrow(()->new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND,"Barbeiro não encontrado"));}
    private void admin(JwtAuthenticationToken auth){if(!java.util.Set.of("ADMIN","SUPER_ADMIN").contains(auth.getToken().getClaimAsString("role")))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,"Ação restrita à administração");}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BarberResponse createBarber(
            @Valid @RequestBody CreateBarberRequest request, JwtAuthenticationToken authentication
    ) {
        admin(authentication);
        UUID tenantId=tenant(authentication);
        if(unitRepository.findById(request.unitId()).filter(u->tenantId.equals(u.getTenant().getId())).isEmpty() || userRepository.findById(request.userId()).filter(u->tenantId.equals(u.getTenantId())&&u.getRole()==com.backend.users.Role.BARBER).isEmpty())throw new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND,"Unidade ou profissional não encontrado");
        return barberService.createBarber(request);
    }

    @GetMapping
    public List<BarberResponse> getBarbers(
            @RequestParam(value = "unitId", required = false) UUID unitId,
            JwtAuthenticationToken authentication
    ) {
        if (unitId != null) {
            if(unitRepository.findById(unitId).filter(u->tenant(authentication).equals(u.getTenant().getId())).isEmpty())throw new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND,"Unidade não encontrada");
            return barberService.listByUnit(unitId);
        }

        String tenantIdClaim = authentication.getToken().getClaimAsString("tenantId");
        if (tenantIdClaim == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Usuário autenticado não está vinculado a nenhuma barbearia"
            );
        }

        return barberService.listByTenant(UUID.fromString(tenantIdClaim));
    }

    @GetMapping("/me")
    public BarberResponse getMyBarberProfile(
            JwtAuthenticationToken authentication
    ) {
        UUID userId = UUID.fromString(authentication.getToken().getSubject());
        return barberService.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public BarberResponse getBarberById(
            @PathVariable("id") UUID id, JwtAuthenticationToken authentication
    ) {
        scoped(id,authentication);
        return barberService.findById(id);
    }

    @PatchMapping("/{id}")
    public BarberResponse updateBarber(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateBarberRequest request, JwtAuthenticationToken authentication
    ) {
        var barber=scoped(id,authentication);
        if("BARBER".equals(authentication.getToken().getClaimAsString("role")) && (!barber.getUser().getId().toString().equals(authentication.getToken().getSubject()) || request.defaultCommissionPercent()!=null))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,"Você só pode editar seu nome e sua descrição");
        return barberService.updateBarber(id, request);
    }

    @PatchMapping("/{id}/status")
    public BarberResponse changeStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateBarberStatusRequest request, JwtAuthenticationToken authentication
    ) {
        admin(authentication);
        scoped(id,authentication);
        return barberService.changeStatus(
                id,
                request.status()
        );
    }
}