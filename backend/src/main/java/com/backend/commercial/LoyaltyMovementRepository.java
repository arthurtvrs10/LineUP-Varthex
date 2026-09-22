package com.backend.commercial;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface LoyaltyMovementRepository extends JpaRepository<LoyaltyMovement, UUID> {
    java.util.List<LoyaltyMovement> findAllByTenantId(UUID tenantId);
}
