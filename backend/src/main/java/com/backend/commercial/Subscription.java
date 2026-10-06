package com.backend.commercial;

import jakarta.persistence.*;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "saas_subscriptions")
public class Subscription {
    @Id
    public UUID id = UUID.randomUUID();
    @Version
    public Long version;
    @Column(name = "tenant_id")
    public UUID tenantId;
    @Column(name = "plan_id")
    public UUID planId;
    public Integer barberLimit;
    @Column(name = "status", length = 1000)
    public String status;
    @Column(name = "starts_on")
    public LocalDate startsOn;
    @Column(name = "ends_on")
    public LocalDate endsOn;
    @Column(name = "reason", length = 1000)
    public String reason;
}
