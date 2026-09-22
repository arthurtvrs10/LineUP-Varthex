package com.backend.commercial;

import jakarta.persistence.*;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
public class StockMovement {
    @Id
    public UUID id = UUID.randomUUID();
    @Version
    public Long version;
    @Column(name = "tenant_id")
    public UUID tenantId;
    @Column(name = "product_id")
    public UUID productId;
    @Column(name = "quantity")
    public Integer quantity;
    @Column(name = "kind", length = 1000)
    public String kind;
    @Column(name = "reason", length = 1000)
    public String reason;
    @Column(name = "request_key", length = 1000)
    public String requestKey;
    @Column(name = "created_by")
    public UUID createdBy;
    @Column(name = "created_at")
    public LocalDateTime createdAt;
}
