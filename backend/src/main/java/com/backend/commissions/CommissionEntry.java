package com.backend.commissions;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

// Append-only (RN-COM-004): nunca é editado depois de criado, só lido ou
// revertido por um novo lançamento (reversalOfId aponta pro original).
@Entity
@Table(name = "commission_entries")
public class CommissionEntry {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "appointment_id")
    private UUID appointmentId;

    @Column(name = "appointment_item_id")
    private UUID appointmentItemId;

    @Column(name = "barber_id", nullable = false)
    private UUID barberId;

    @Column(name = "commission_rule_id")
    private UUID commissionRuleId;

    @Column(name = "base_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal baseAmount;

    @Column(nullable = false, precision = 7, scale = 4)
    private BigDecimal percentage;

    @Column(name = "fixed_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal fixedAmount;

    @Column(name = "commission_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal commissionAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommissionStatus status;

    @Column(name = "reversal_of_id")
    private UUID reversalOfId;

    @Column(length = 500)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public CommissionEntry() {
    }

    public CommissionEntry(UUID tenantId, UUID appointmentId, UUID appointmentItemId, UUID barberId,
                            UUID commissionRuleId, BigDecimal baseAmount, BigDecimal percentage,
                            BigDecimal fixedAmount, BigDecimal commissionAmount, CommissionStatus status,
                            UUID reversalOfId, String reason) {
        this.tenantId = tenantId;
        this.appointmentId = appointmentId;
        this.appointmentItemId = appointmentItemId;
        this.barberId = barberId;
        this.commissionRuleId = commissionRuleId;
        this.baseAmount = baseAmount;
        this.percentage = percentage;
        this.fixedAmount = fixedAmount;
        this.commissionAmount = commissionAmount;
        this.status = status;
        this.reversalOfId = reversalOfId;
        this.reason = reason;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public UUID getAppointmentId() {
        return appointmentId;
    }

    public UUID getAppointmentItemId() {
        return appointmentItemId;
    }

    public UUID getBarberId() {
        return barberId;
    }

    public UUID getCommissionRuleId() {
        return commissionRuleId;
    }

    public BigDecimal getBaseAmount() {
        return baseAmount;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public BigDecimal getFixedAmount() {
        return fixedAmount;
    }

    public BigDecimal getCommissionAmount() {
        return commissionAmount;
    }

    public CommissionStatus getStatus() {
        return status;
    }

    public UUID getReversalOfId() {
        return reversalOfId;
    }

    public String getReason() {
        return reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
