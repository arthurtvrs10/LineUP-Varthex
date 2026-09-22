package com.backend.commercial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface BusinessSettingsRepository extends JpaRepository<BusinessSettings,UUID>{}
