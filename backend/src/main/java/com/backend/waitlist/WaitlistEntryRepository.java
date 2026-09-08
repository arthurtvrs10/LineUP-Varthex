package com.backend.waitlist;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, UUID> {

    List<WaitlistEntry> findAllByTenantIdAndStatusOrderByCreatedAtAsc(UUID tenantId, WaitlistStatus status);

    List<WaitlistEntry> findAllByTenantIdAndCustomerIdOrderByCreatedAtDesc(UUID tenantId, UUID customerId);
}
