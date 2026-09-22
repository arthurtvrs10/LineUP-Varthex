package com.backend.commercial;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CampaignRepository extends JpaRepository<Campaign, UUID> {
    java.util.List<Campaign> findAllByTenantId(UUID tenantId);
}
