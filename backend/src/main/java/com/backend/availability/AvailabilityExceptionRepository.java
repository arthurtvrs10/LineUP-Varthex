package com.backend.availability;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AvailabilityExceptionRepository extends JpaRepository<AvailabilityException, UUID> {

    List<AvailabilityException> findAllByBarberId(UUID barberId);

    @Query("""
            SELECT e FROM AvailabilityException e
            WHERE e.barberId = :barberId AND e.startsAt < :to AND e.endsAt > :from
            """)
    List<AvailabilityException> findAllOverlapping(
            @Param("barberId") UUID barberId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
