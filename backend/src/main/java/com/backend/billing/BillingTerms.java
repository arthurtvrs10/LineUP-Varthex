package com.backend.billing;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name="billing_terms")
public class BillingTerms {
    @Id public UUID id=UUID.randomUUID();
    @Version public Long version;
    public UUID accountId;
    public UUID planId;
    public String planName;
    public UUID addonId;
    public String addonName;
    public int addonQuantity;
    @Column(precision=19,scale=2) public BigDecimal basePrice;
    @Column(precision=19,scale=2) public BigDecimal addonUnitPrice;
    @Column(precision=19,scale=2) public BigDecimal monthlyPrice;
    public int barberLimit;
    public String method;
    public LocalDate effectiveOn;
    public String state;
    public LocalDateTime expiresAt;
    public LocalDateTime createdAt=LocalDateTime.now();
}
