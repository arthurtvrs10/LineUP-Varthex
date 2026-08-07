package com.backend.barbershops;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BarbershopRepository extends JpaRepository<Barbershop, UUID> {
    boolean existsByEmail(String email);  // Duplicate Check
    boolean existsByDocumentNumber(String documentNumber); // Duplicate Check
}
