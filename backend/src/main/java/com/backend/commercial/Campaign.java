package com.backend.commercial;

import jakarta.persistence.*;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "crm_campaigns")
public class Campaign {
    @Id
    public UUID id = UUID.randomUUID();
    @Version
    public Long version;
    @Column(name = "tenant_id")
    public UUID tenantId;
    @Column(name = "name", length = 1000)
    public String name;
    @Column(name = "segment", length = 1000)
    public String segment;
    @Column(name = "message", length = 1000)
    public String message;
    @Column(name = "status", length = 1000)
    public String status;
    @Column(name = "created_at")
    public LocalDateTime createdAt;
}
