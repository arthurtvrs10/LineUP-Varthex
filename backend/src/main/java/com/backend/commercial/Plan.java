package com.backend.commercial;

import jakarta.persistence.*;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "saas_plans")
public class Plan {
    @Id
    public UUID id = UUID.randomUUID();
    @Version
    public Long version;
    @Column(name = "name", length = 1000)
    public String name;
    @Column(name = "monthly_price", precision = 19, scale = 2)
    public BigDecimal monthlyPrice;
    @Column(name = "barber_limit")
    public Integer barberLimit;
    @Column(name = "active")
    public Boolean active;
    @Column(name = "created_at")
    public LocalDateTime createdAt;
}
