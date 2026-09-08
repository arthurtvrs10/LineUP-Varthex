package com.backend.commissions;

import com.backend.barbers.BarberRepository;
import com.backend.commissions.dto.CommissionAdjustmentRequest;
import com.backend.commissions.dto.CommissionEntryResponse;
import com.backend.commissions.dto.CommissionRuleRequest;
import com.backend.commissions.dto.CommissionRuleResponse;
import com.backend.commissions.dto.CommissionSummaryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
public class CommissionController {

    private final CommissionService commissionService;
    private final BarberRepository barberRepository;

    public CommissionController(CommissionService commissionService, BarberRepository barberRepository) {
        this.commissionService = commissionService;
        this.barberRepository = barberRepository;
    }

    @PostMapping("/commission-rules")
    @ResponseStatus(HttpStatus.CREATED)
    public CommissionRuleResponse createRule(@RequestBody CommissionRuleRequest request,
                                              JwtAuthenticationToken authentication) {
        return commissionService.createRule(currentTenantId(authentication), request);
    }

    @GetMapping("/commission-rules")
    public List<CommissionRuleResponse> listRules(JwtAuthenticationToken authentication) {
        return commissionService.listRules(currentTenantId(authentication));
    }

    @PatchMapping("/commission-rules/{id}")
    public CommissionRuleResponse updateRule(@PathVariable UUID id, @RequestBody CommissionRuleRequest request,
                                              JwtAuthenticationToken authentication) {
        return commissionService.updateRule(currentTenantId(authentication), id, request);
    }

    // Mesma regra de escopo do resumo (RN-COM-004), mas devolve os lançamentos
    // individuais em vez do agregado — usado pela tela de histórico do barbeiro.
    @GetMapping("/commissions")
    public List<CommissionEntryResponse> list(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to,
            @RequestParam(required = false) UUID barberId,
            JwtAuthenticationToken authentication
    ) {
        UUID tenantId = currentTenantId(authentication);
        UUID effectiveBarberId = "BARBER".equals(role(authentication)) ? ownBarberId(authentication) : barberId;
        return commissionService.listEntries(tenantId, from, to, effectiveBarberId);
    }

    // Admin/SuperAdmin veem a equipe inteira; BARBER só os próprios lançamentos (RN-COM-004) —
    // barberId da query é ignorado pra esse role, sempre força o barberId do próprio JWT.
    @GetMapping("/commissions/summary")
    public CommissionSummaryResponse summary(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to,
            @RequestParam(required = false) UUID barberId,
            JwtAuthenticationToken authentication
    ) {
        UUID tenantId = currentTenantId(authentication);
        UUID effectiveBarberId = "BARBER".equals(role(authentication)) ? ownBarberId(authentication) : barberId;
        return commissionService.summary(tenantId, from, to, effectiveBarberId);
    }

    @PostMapping("/commission-adjustments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommissionEntryResponse adjust(@RequestBody CommissionAdjustmentRequest request,
                                           JwtAuthenticationToken authentication) {
        return commissionService.adjust(currentTenantId(authentication), request);
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

    private String role(JwtAuthenticationToken authentication) {
        return authentication.getToken().getClaimAsString("role");
    }

    private UUID ownBarberId(JwtAuthenticationToken authentication) {
        UUID userId = UUID.fromString(authentication.getToken().getSubject());
        return barberRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Este usuário não tem um perfil de barbeiro"))
                .getId();
    }
}
