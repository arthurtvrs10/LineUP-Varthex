package com.backend.commercial;

import jakarta.persistence.*;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_registers")
public class CashRegister {
    @Id
    public UUID id = UUID.randomUUID();
    @Version
    public Long version;
    @Column(name = "tenant_id")
    public UUID tenantId;
    @Column(name = "opened_by")
    public UUID openedBy;
    @Column(name = "opened_at")
    public LocalDateTime openedAt;
    @Column(name = "opening_amount", precision = 19, scale = 2)
    public BigDecimal openingAmount;
    @Column(name = "closed_at")
    public LocalDateTime closedAt;
    @Column(name = "expected_amount", precision = 19, scale = 2)
    public BigDecimal expectedAmount;
    @Column(name = "counted_amount", precision = 19, scale = 2)
    public BigDecimal countedAmount;
    @Column(name = "closing_reason", length = 1000)
    public String closingReason;
}
