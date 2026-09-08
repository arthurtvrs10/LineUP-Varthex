package com.backend.barbers;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BarberRepository extends JpaRepository<BarberProfile, UUID> {

    boolean existsByUser_Id(UUID userId);

    List<BarberProfile> findAllByUnit_Id(UUID unitId);

    Optional<BarberProfile> findByUser_Id(UUID userId);
}
