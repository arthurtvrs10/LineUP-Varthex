package com.backend.billing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface BillingChargeRepository extends JpaRepository<BillingCharge, UUID> {
    Optional<BillingCharge> findByProviderId(String providerId);
    List<BillingCharge> findAllByAccountIdOrderByDueDateDesc(UUID accountId);
}
