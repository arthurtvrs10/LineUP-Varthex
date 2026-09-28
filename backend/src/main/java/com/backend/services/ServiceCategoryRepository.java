package com.backend.services;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, UUID> {
    @org.springframework.data.jpa.repository.Query("select count(c) from ServiceCategory c where c.tenantId = :tenantId and lower(trim(c.name)) = lower(:name)")
    long countMatchingName(UUID tenantId, String name);
    List<ServiceCategory> findAllByTenantIdOrderBySortOrderAsc(UUID tenantId);
}
