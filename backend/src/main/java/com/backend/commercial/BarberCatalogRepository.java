package com.backend.commercial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface BarberCatalogRepository extends JpaRepository<BarberCatalog,UUID>{}
