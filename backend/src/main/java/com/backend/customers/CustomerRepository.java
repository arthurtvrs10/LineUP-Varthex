package com.backend.customers;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Page<Customer> findAllByTenantId(UUID tenantId, Pageable pageable);

    Page<Customer> findAllByTenantIdAndFullNameContainingIgnoreCase(
            UUID tenantId, String query, Pageable pageable
    );
}
