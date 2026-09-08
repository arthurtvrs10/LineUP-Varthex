package com.backend.tenants;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    boolean existsByEmail(String email);
    boolean existsByDocument(String document);
}
