package com.backend.commercial;
import jakarta.persistence.*;
import java.util.UUID;
import java.time.LocalDateTime;
@Entity @Table(name="communication_consents")
public class CommunicationConsent {
 @Id public UUID userId;
 @Version public Long version;
 public boolean marketing=false;
 public LocalDateTime updatedAt;
}
