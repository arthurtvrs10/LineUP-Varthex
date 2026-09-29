package com.backend.scheduling;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    @Query("""
        select a from Appointment a where a.tenantId = :tenantId and a.customerId = :customerId
        and a.status = com.backend.scheduling.AppointmentStatus.COMPLETED
        and not exists (select r.id from Review r where r.tenantId = a.tenantId and r.appointmentId = a.id)
        order by a.endAt desc, a.id
        """)
    List<Appointment> findPendingReviews(UUID tenantId, UUID customerId);

    List<Appointment> findAllByTenantIdAndStartAtLessThanAndEndAtGreaterThan(
            UUID tenantId, LocalDateTime to, LocalDateTime from
    );

    List<Appointment> findAllByTenantIdAndBarberIdAndStartAtLessThanAndEndAtGreaterThan(
            UUID tenantId, UUID barberId, LocalDateTime to, LocalDateTime from
    );

    // Intervalo [startAt, endAt) — um atendimento pode começar exatamente
    // quando o anterior termina (ADR-013). Só considera agendamentos que
    // ainda "ocupam" a agenda (exclui cancelado/no-show).
    @Query("""
            SELECT COUNT(a) > 0 FROM Appointment a
            WHERE a.barberId = :barberId
              AND a.status NOT IN (com.backend.scheduling.AppointmentStatus.CANCELED, com.backend.scheduling.AppointmentStatus.NO_SHOW)
              AND (:excludeId IS NULL OR a.id <> :excludeId)
              AND a.startAt < :endAt
              AND a.endAt > :startAt
            """)
    boolean hasConflict(
            @Param("barberId") UUID barberId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("excludeId") UUID excludeId
    );
}
