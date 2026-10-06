package com.backend.billing;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "billing_addons")
public class BillingAddon {
    @Id public UUID id = UUID.randomUUID();
    public UUID planId;
    public String name;
    public String code;
    @Column(precision = 19, scale = 2) public BigDecimal monthlyPrice;
    public int maxQuantity;
    public boolean active;
}
