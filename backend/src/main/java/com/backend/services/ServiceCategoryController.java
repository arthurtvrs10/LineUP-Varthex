package com.backend.services;

import com.backend.services.dto.ServiceCategoryRequest;
import com.backend.services.dto.ServiceCategoryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/service-categories")
public class ServiceCategoryController {

    private final ServiceCategoryService categoryService;

    public ServiceCategoryController(ServiceCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceCategoryResponse createCategory(
            @RequestBody ServiceCategoryRequest request,
            JwtAuthenticationToken authentication
    ) {
        return categoryService.createCategory(currentTenantId(authentication), request);
    }

    @GetMapping
    public List<ServiceCategoryResponse> getCategories(JwtAuthenticationToken authentication) {
        return categoryService.listCategories(currentTenantId(authentication));
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
