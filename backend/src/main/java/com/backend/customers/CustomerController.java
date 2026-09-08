package com.backend.customers;

import com.backend.customers.dto.CustomerPageResponse;
import com.backend.customers.dto.CustomerRequest;
import com.backend.customers.dto.CustomerResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse createCustomer(
            @RequestBody CustomerRequest request,
            JwtAuthenticationToken authentication
    ) {
        return customerService.createCustomer(currentTenantId(authentication), request);
    }

    @GetMapping
    public CustomerPageResponse getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String query,
            JwtAuthenticationToken authentication
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return customerService.listCustomers(currentTenantId(authentication), query, pageable);
    }

    @GetMapping("/{customerId}")
    public CustomerResponse getCustomer(
            @PathVariable UUID customerId,
            JwtAuthenticationToken authentication
    ) {
        return customerService.getCustomer(currentTenantId(authentication), customerId);
    }

    @PatchMapping("/{customerId}")
    public CustomerResponse updateCustomer(
            @PathVariable UUID customerId,
            @RequestBody CustomerRequest request,
            JwtAuthenticationToken authentication
    ) {
        return customerService.updateCustomer(currentTenantId(authentication), customerId, request);
    }

    @DeleteMapping("/{customerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archiveCustomer(
            @PathVariable UUID customerId,
            JwtAuthenticationToken authentication
    ) {
        customerService.archiveCustomer(currentTenantId(authentication), customerId);
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
