package com.backend.billing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface BillingAccountRepository extends JpaRepository<BillingAccount, UUID> {
    Optional<BillingAccount> findByTenantId(UUID tenantId);
    Optional<BillingAccount> findByCustomerId(String customerId);
    Optional<BillingAccount> findByCheckoutId(String checkoutId);
    Optional<BillingAccount> findByProviderSubscriptionId(String providerSubscriptionId);
}
