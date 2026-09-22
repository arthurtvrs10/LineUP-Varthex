package com.backend.commercial;

import jakarta.persistence.*;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "commercial_audit_events")
public class AuditEvent {
    @Id
    public UUID id = UUID.randomUUID();
    @Column(length=4000)
    public String detail;
    @Version
    public Long version;
    @Column(name = "tenant_id")
    public UUID tenantId;
    @Column(name = "actor_id")
    public UUID actorId;
    @Column(name = "action", length = 1000)
    public String action;
    @Column(name = "target_id")
    public UUID targetId;
    @Column(name = "created_at")
    public LocalDateTime createdAt;
}
