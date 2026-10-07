package com.backend.billing;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "billing_charges")
public class BillingCharge {
    @Id public UUID id = UUID.randomUUID();
    @Version public Long version;
    @Column(nullable = false) public UUID accountId;
    public UUID termsId;
    @Column(nullable = false, unique = true) public String providerId;
    public String status;
    public String failureCode;
    public LocalDate dueDate;
    public LocalDate paymentDate;
    public LocalDate availableOn;
    @Column(precision = 19, scale = 2) public BigDecimal gross;
    @Column(precision = 19, scale = 2) public BigDecimal net;
    @Column(precision = 19, scale = 2) public BigDecimal refunded = BigDecimal.ZERO;
    @Column(length = 1000) public String invoiceUrl;
    public String refundState;
    public String refundKey;
    @Column(precision = 19, scale = 2) public BigDecimal refundAmount;
    @Column(precision = 19, scale = 2) public BigDecimal refundBaseline;
    @Column(length = 1000) public String refundReason;
    public LocalDateTime updatedAt;
    public String noticeStatus;
    public boolean noticeEmailSent;
}
