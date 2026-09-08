package com.backend.barbers;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BarberRepository extends JpaRepository<BarberProfile, UUID> {

    boolean existsByUser_Id(UUID userId);

    List<BarberProfile> findAllByUnit_Id(UUID unitId);
}
