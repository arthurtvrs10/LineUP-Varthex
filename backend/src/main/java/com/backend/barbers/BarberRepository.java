package com.backend.barbers;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BarberRepository extends JpaRepository<BarberProfile, UUID> {

    boolean existsByUser_Id(UUID userId);

    List<BarberProfile> findAllByUnit_Id(UUID unitId);

    List<BarberProfile> findAllByUnit_Tenant_Id(UUID tenantId);

    Optional<BarberProfile> findByUser_Id(UUID userId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select b from BarberProfile b where b.id = :id")
    Optional<BarberProfile> findLockedById(@org.springframework.data.repository.query.Param("id") UUID id);
}
