package com.backend.services;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, UUID> {
    List<ServiceOffering> findAllByTenantIdOrderBySortOrderAsc(UUID tenantId);

    List<ServiceOffering> findAllByTenantIdAndActiveOrderBySortOrderAsc(UUID tenantId, boolean active);
}
