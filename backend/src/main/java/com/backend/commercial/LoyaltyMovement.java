package com.backend.commercial;

import jakarta.persistence.*;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_movements")
public class LoyaltyMovement {
    @Id
    public UUID id = UUID.randomUUID();
    @Version
    public Long version;
    @Column(name = "tenant_id")
    public UUID tenantId;
    @Column(name = "customer_id")
    public UUID customerId;
    @Column(name = "points")
    public Integer points;
    @Column(name = "reason", length = 1000)
    public String reason;
    @Column(name = "payment_id")
    public UUID paymentId;
    @Column(name = "request_key", length = 1000)
    public String requestKey;
    @Column(name = "created_by")
    public UUID createdBy;
    @Column(name = "created_at")
    public LocalDateTime createdAt;
}
