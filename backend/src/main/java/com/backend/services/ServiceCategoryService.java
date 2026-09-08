package com.backend.services;

import com.backend.services.dto.ServiceCategoryRequest;
import com.backend.services.dto.ServiceCategoryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ServiceCategoryService {

    private final ServiceCategoryRepository categoryRepository;

    public ServiceCategoryService(ServiceCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public ServiceCategoryResponse createCategory(UUID tenantId, ServiceCategoryRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome é obrigatório");
        }

        int sortOrder = request.sortOrder() != null ? request.sortOrder() : 0;
        if (sortOrder < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sortOrder deve ser maior ou igual a 0");
        }

        boolean active = request.active() == null || request.active();

        ServiceCategory category = new ServiceCategory(null, tenantId, request.name(), sortOrder, active);

        return toResponse(categoryRepository.save(category));
    }

    public List<ServiceCategoryResponse> listCategories(UUID tenantId) {
        return categoryRepository.findAllByTenantIdOrderBySortOrderAsc(tenantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ServiceCategoryResponse toResponse(ServiceCategory category) {
        return new ServiceCategoryResponse(
                category.getId(),
                category.getName(),
                category.getSortOrder(),
                category.isActive(),
                category.getVersion()
        );
    }
}
