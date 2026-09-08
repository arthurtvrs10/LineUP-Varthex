package com.backend.commissions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommissionRuleRepository extends JpaRepository<CommissionRule, UUID> {

    List<CommissionRule> findAllByTenantId(UUID tenantId);

    // Regra mais específica vigente pra um barbeiro+serviço, na data informada
    // (RN-COM-001, nível 1: barbeiro+serviço).
    @Query("""
            SELECT r FROM CommissionRule r
            WHERE r.tenantId = :tenantId AND r.barberId = :barberId AND r.serviceId = :serviceId
              AND r.validFrom <= :at AND (r.validTo IS NULL OR r.validTo > :at)
            ORDER BY r.validFrom DESC
            """)
    List<CommissionRule> findEffectiveByBarberAndService(
            @Param("tenantId") UUID tenantId, @Param("barberId") UUID barberId,
            @Param("serviceId") UUID serviceId, @Param("at") LocalDateTime at);

    // Regra vigente só por barbeiro, sem serviço específico (RN-COM-001, nível 2).
    @Query("""
            SELECT r FROM CommissionRule r
            WHERE r.tenantId = :tenantId AND r.barberId = :barberId AND r.serviceId IS NULL
              AND r.validFrom <= :at AND (r.validTo IS NULL OR r.validTo > :at)
            ORDER BY r.validFrom DESC
            """)
    List<CommissionRule> findEffectiveByBarberOnly(
            @Param("tenantId") UUID tenantId, @Param("barberId") UUID barberId, @Param("at") LocalDateTime at);

    default Optional<CommissionRule> findEffectiveRule(UUID tenantId, UUID barberId, UUID serviceId, LocalDateTime at) {
        return findEffectiveByBarberAndService(tenantId, barberId, serviceId, at).stream().findFirst()
                .or(() -> findEffectiveByBarberOnly(tenantId, barberId, at).stream().findFirst());
    }
}
