package com.backend.waitlist;

import com.backend.customers.CustomerRepository;
import com.backend.scheduling.dto.AppointmentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

// Accept/reject de uma oferta de vaga da fila de espera (RN-FIL-004).
// Staff também pode responder em nome do cliente (ex.: confirmação por
// telefone) — só CLIENT tem o escopo restrito à própria entrada.
@RestController
@RequestMapping("/waitlist-offers")
public class WaitlistOfferController {

    private final WaitlistService waitlistService;
    private final CustomerRepository customerRepository;

    public WaitlistOfferController(WaitlistService waitlistService, CustomerRepository customerRepository) {
        this.waitlistService = waitlistService;
        this.customerRepository = customerRepository;
    }

    @PostMapping("/{id}/accept")
    public AppointmentResponse accept(@PathVariable UUID id, JwtAuthenticationToken authentication) {
        return waitlistService.acceptOffer(currentTenantId(authentication), id, restrictToOwnCustomer(authentication));
    }

    @PostMapping("/{id}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reject(@PathVariable UUID id, JwtAuthenticationToken authentication) {
        waitlistService.rejectOffer(currentTenantId(authentication), id, restrictToOwnCustomer(authentication));
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

    private UUID restrictToOwnCustomer(JwtAuthenticationToken authentication) {
        String role = authentication.getToken().getClaimAsString("role");

        if (!"CLIENT".equals(role)) {
            return null;
        }

        UUID userId = UUID.fromString(authentication.getToken().getSubject());

        return customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Você ainda não é cliente de nenhuma barbearia"
                ))
                .getId();
    }
}
