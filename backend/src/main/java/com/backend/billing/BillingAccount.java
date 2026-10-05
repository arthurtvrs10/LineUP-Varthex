package com.backend.billing;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "billing_accounts")
public class BillingAccount {
    @Id public UUID id = UUID.randomUUID();
    @Version public Long version;
    @Column(unique = true, nullable = false) public UUID tenantId;
    public UUID planId;
    public UUID actorId;
    @Column(precision = 19, scale = 2) public BigDecimal monthlyPrice;
    @Column(unique = true) public String customerId;
    @Column(unique = true) public String providerSubscriptionId;
    @Column(unique = true) public String checkoutId;
    @Column(length = 1000) public String checkoutUrl;
    public String method;
    public String state;
    public String requestKey;
    public String requestFingerprint;
    public boolean cancelRequested;
    public LocalDateTime checkoutExpiresAt;
    public LocalDateTime createdAt = LocalDateTime.now();
    public LocalDateTime syncedAt;
    @Column(length = 1000) public String issue;
}
