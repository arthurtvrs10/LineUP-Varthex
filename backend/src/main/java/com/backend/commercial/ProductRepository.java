package com.backend.commercial;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    java.util.List<Product> findAllByTenantId(UUID tenantId);
}
