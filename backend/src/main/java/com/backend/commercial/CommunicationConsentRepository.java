package com.backend.commercial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface CommunicationConsentRepository extends JpaRepository<CommunicationConsent,UUID>{}
