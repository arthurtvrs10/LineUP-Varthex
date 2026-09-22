package com.backend.commercial;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {
    java.util.List<StockMovement> findAllByTenantId(UUID tenantId);
}
