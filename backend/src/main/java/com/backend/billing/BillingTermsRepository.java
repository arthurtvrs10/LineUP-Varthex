package com.backend.billing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface BillingTermsRepository extends JpaRepository<BillingTerms,UUID> {
    List<BillingTerms> findAllByAccountIdOrderByEffectiveOnDescCreatedAtDesc(UUID accountId);
}
