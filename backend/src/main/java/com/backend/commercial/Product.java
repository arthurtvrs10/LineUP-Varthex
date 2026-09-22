package com.backend.commercial;

import jakarta.persistence.*;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
    @Id
    public UUID id = UUID.randomUUID();
    @Version
    public Long version;
    @Column(name = "tenant_id")
    public UUID tenantId;
    @Column(name = "name", length = 1000)
    public String name;
    @Column(name = "sku", length = 1000)
    public String sku;
    @Column(name = "category", length = 1000)
    public String category;
    @Column(name = "supplier", length = 1000)
    public String supplier;
    @Column(name = "cost", precision = 19, scale = 2)
    public BigDecimal cost;
    @Column(name = "price", precision = 19, scale = 2)
    public BigDecimal price;
    @Column(name = "minimum_stock")
    public Integer minimumStock;
    @Column(name = "active")
    public Boolean active;
}
