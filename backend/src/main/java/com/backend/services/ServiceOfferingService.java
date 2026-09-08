package com.backend.services;

import com.backend.services.dto.ServiceRequest;
import com.backend.services.dto.ServiceResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class ServiceOfferingService {

    private static final Pattern MONEY_PATTERN = Pattern.compile("^[0-9]+(\\.[0-9]{1,2})?$");

    private final ServiceOfferingRepository serviceRepository;
    private final ServiceCategoryRepository categoryRepository;

    public ServiceOfferingService(ServiceOfferingRepository serviceRepository,
                                   ServiceCategoryRepository categoryRepository) {
        this.serviceRepository = serviceRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public ServiceResponse createService(UUID tenantId, ServiceRequest request) {
        validate(request);
        validateCategoryBelongsToTenant(tenantId, request.categoryId());

        ServiceOffering service = new ServiceOffering(
                null,
                tenantId,
                request.unitId(),
                request.categoryId(),
                request.serviceType(),
                request.name(),
                request.description(),
                request.durationMinutes(),
                request.bufferBeforeMinutes(),
                request.bufferAfterMinutes(),
                parsePrice(request.price()),
                request.sortOrder(),
                request.active() == null || request.active()
        );

        return toResponse(serviceRepository.save(service));
    }

    public List<ServiceResponse> listServices(UUID tenantId, Boolean active) {
        List<ServiceOffering> services = active == null
                ? serviceRepository.findAllByTenantIdOrderBySortOrderAsc(tenantId)
                : serviceRepository.findAllByTenantIdAndActiveOrderBySortOrderAsc(tenantId, active);

        return services.stream().map(this::toResponse).toList();
    }

    @Transactional
    public ServiceResponse updateService(UUID tenantId, UUID serviceId, ServiceRequest request) {
        validate(request);
        validateCategoryBelongsToTenant(tenantId, request.categoryId());

        ServiceOffering service = findByIdAndTenant(tenantId, serviceId);

        if (!service.getVersion().equals(request.version())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O serviço foi modificado por outra requisição; recarregue e tente novamente"
            );
        }

        service.setUnitId(request.unitId());
        service.setCategoryId(request.categoryId());
        service.setServiceType(request.serviceType());
        service.setName(request.name());
        service.setDescription(request.description());
        service.setDurationMinutes(request.durationMinutes());
        service.setBufferBeforeMinutes(request.bufferBeforeMinutes());
        service.setBufferAfterMinutes(request.bufferAfterMinutes());
        service.setPrice(parsePrice(request.price()));
        service.setSortOrder(request.sortOrder());
        service.setActive(request.active() == null || request.active());

        return toResponse(serviceRepository.save(service));
    }

    private ServiceOffering findByIdAndTenant(UUID tenantId, UUID serviceId) {
        ServiceOffering service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado"));

        if (!service.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado");
        }

        return service;
    }

    private void validateCategoryBelongsToTenant(UUID tenantId, UUID categoryId) {
        if (categoryId == null) {
            return;
        }

        ServiceCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria não encontrada"));

        if (!category.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria não encontrada");
        }
    }

    private void validate(ServiceRequest request) {
        if (request.serviceType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "serviceType é obrigatório");
        }
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome é obrigatório");
        }
        if (request.durationMinutes() == null || request.durationMinutes() < 5 || request.durationMinutes() > 720) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "durationMinutes deve estar entre 5 e 720");
        }
        if (request.bufferBeforeMinutes() == null || request.bufferBeforeMinutes() < 0 || request.bufferBeforeMinutes() > 240) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bufferBeforeMinutes deve estar entre 0 e 240");
        }
        if (request.bufferAfterMinutes() == null || request.bufferAfterMinutes() < 0 || request.bufferAfterMinutes() > 240) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bufferAfterMinutes deve estar entre 0 e 240");
        }
        if (request.sortOrder() == null || request.sortOrder() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sortOrder deve ser maior ou igual a 0");
        }
        if (request.price() == null || !MONEY_PATTERN.matcher(request.price()).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "price inválido");
        }
    }

    private BigDecimal parsePrice(String price) {
        return new BigDecimal(price).setScale(2, RoundingMode.HALF_EVEN);
    }

    private ServiceResponse toResponse(ServiceOffering service) {
        return new ServiceResponse(
                service.getId(),
                service.getUnitId(),
                service.getCategoryId(),
                service.getServiceType(),
                service.getName(),
                service.getDescription(),
                service.getDurationMinutes(),
                service.getBufferBeforeMinutes(),
                service.getBufferAfterMinutes(),
                service.getPrice().toPlainString(),
                service.getSortOrder(),
                service.isActive(),
                service.getVersion()
        );
    }
}
