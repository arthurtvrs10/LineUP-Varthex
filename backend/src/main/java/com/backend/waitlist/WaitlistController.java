package com.backend.waitlist;

import com.backend.customers.CustomerRepository;
import com.backend.waitlist.dto.WaitlistEntryRequest;
import com.backend.waitlist.dto.WaitlistEntryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/waitlist-entries")
public class WaitlistController {

    private final WaitlistService waitlistService;
    private final CustomerRepository customerRepository;

    public WaitlistController(WaitlistService waitlistService, CustomerRepository customerRepository) {
        this.waitlistService = waitlistService;
        this.customerRepository = customerRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WaitlistEntryResponse create(@RequestBody WaitlistEntryRequest request, JwtAuthenticationToken authentication) {
        return waitlistService.create(currentTenantId(authentication), request, restrictToOwnCustomer(authentication));
    }

    @GetMapping
    public List<WaitlistEntryResponse> list(JwtAuthenticationToken authentication) {
        return waitlistService.list(currentTenantId(authentication), restrictToOwnCustomer(authentication));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable UUID id, JwtAuthenticationToken authentication) {
        waitlistService.cancel(currentTenantId(authentication), id, restrictToOwnCustomer(authentication));
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
