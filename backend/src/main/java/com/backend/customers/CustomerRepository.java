package com.backend.customers;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Page<Customer> findAllByTenantId(UUID tenantId, Pageable pageable);

    Page<Customer> findAllByTenantIdAndFullNameContainingIgnoreCase(
            UUID tenantId, String query, Pageable pageable
    );

    Optional<Customer> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    @org.springframework.data.jpa.repository.Query("select c from Customer c where c.status = com.backend.customers.CustomerStatus.ACTIVE and (c.userId = :userId or (c.userId is null and lower(trim(c.email)) = lower(:email))) order by c.createdAt, c.id")
    java.util.List<Customer> findInitialBarbershops(
            @org.springframework.data.repository.query.Param("userId") UUID userId,
            @org.springframework.data.repository.query.Param("email") String email);

    @org.springframework.data.jpa.repository.Query("select c from Customer c where c.tenantId = :tenantId and lower(trim(c.email)) = lower(:email)")
    java.util.List<Customer> findAllByTenantIdAndEmailIgnoreCase(
            @org.springframework.data.repository.query.Param("tenantId") UUID tenantId,
            @org.springframework.data.repository.query.Param("email") String email);
}
