package com.backend.billing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BillingEventRepository extends JpaRepository<BillingEvent, String> {
    List<BillingEvent> findTop50ByProcessedFalseAndNextAttemptAtLessThanEqualOrderByReceivedAtAsc(java.time.LocalDateTime now);
}
