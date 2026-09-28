package com.backend.tenants;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select t from Tenant t where t.id = :id")
    java.util.Optional<Tenant> findLockedById(UUID id);
    boolean existsByEmail(String email);
    boolean existsByDocument(String document);
}
