package com.backend.commissions;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "commission_rules")
public class CommissionRule {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "barber_id")
    private UUID barberId;

    @Column(name = "service_id")
    private UUID serviceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommissionType type;

    @Column(precision = 7, scale = 4)
    private BigDecimal percentage;

    @Column(name = "fixed_amount", precision = 19, scale = 2)
    private BigDecimal fixedAmount;

    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "valid_to")
    private LocalDateTime validTo;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public CommissionRule() {
    }

    public CommissionRule(UUID tenantId, UUID barberId, UUID serviceId, CommissionType type,
                           BigDecimal percentage, BigDecimal fixedAmount,
                           LocalDateTime validFrom, LocalDateTime validTo) {
        this.tenantId = tenantId;
        this.barberId = barberId;
        this.serviceId = serviceId;
        this.type = type;
        this.percentage = percentage;
        this.fixedAmount = fixedAmount;
        this.validFrom = validFrom;
        this.validTo = validTo;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public UUID getBarberId() {
        return barberId;
    }

    public UUID getServiceId() {
        return serviceId;
    }

    public CommissionType getType() {
        return type;
    }

    public void setType(CommissionType type) {
        this.type = type;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }

    public BigDecimal getFixedAmount() {
        return fixedAmount;
    }

    public void setFixedAmount(BigDecimal fixedAmount) {
        this.fixedAmount = fixedAmount;
    }

    public LocalDateTime getValidFrom() {
        return validFrom;
    }

    public void setValidFrom(LocalDateTime validFrom) {
        this.validFrom = validFrom;
    }

    public LocalDateTime getValidTo() {
        return validTo;
    }

    public void setValidTo(LocalDateTime validTo) {
        this.validTo = validTo;
    }

    public Long getVersion() {
        return version;
    }
}
