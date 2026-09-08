package com.backend.dashboard;

import com.backend.barbers.BarberRepository;
import com.backend.dashboard.dto.DashboardOverviewResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.UUID;

@RestController
public class DashboardController {

    private final DashboardService dashboardService;
    private final BarberRepository barberRepository;

    public DashboardController(DashboardService dashboardService, BarberRepository barberRepository) {
        this.dashboardService = dashboardService;
        this.barberRepository = barberRepository;
    }

    @GetMapping("/dashboard/overview")
    public DashboardOverviewResponse overview(
            @RequestParam LocalDate date,
            @RequestParam(required = false) UUID barberId,
            JwtAuthenticationToken authentication
    ) {
        UUID tenantId = currentTenantId(authentication);
        UUID effectiveBarberId = "BARBER".equals(role(authentication)) ? ownBarberId(authentication) : barberId;
        return dashboardService.overview(tenantId, date, effectiveBarberId);
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
