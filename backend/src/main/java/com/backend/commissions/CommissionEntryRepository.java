package com.backend.commissions;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface CommissionEntryRepository extends JpaRepository<CommissionEntry, UUID> {

    List<CommissionEntry> findAllByTenantIdAndCreatedAtBetween(UUID tenantId, LocalDateTime from, LocalDateTime to);

    List<CommissionEntry> findAllByTenantIdAndBarberIdAndCreatedAtBetween(
            UUID tenantId, UUID barberId, LocalDateTime from, LocalDateTime to);

    List<CommissionEntry> findAllByAppointmentId(UUID appointmentId);

    List<CommissionEntry> findAllByTenantIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            UUID tenantId, LocalDateTime from, LocalDateTime to);

    List<CommissionEntry> findAllByTenantIdAndBarberIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            UUID tenantId, UUID barberId, LocalDateTime from, LocalDateTime to);
}
