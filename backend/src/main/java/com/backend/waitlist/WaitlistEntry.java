package com.backend.waitlist;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "waitlist_entries")
public class WaitlistEntry {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "unit_id", nullable = false)
    private UUID unitId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "service_id", nullable = false)
    private UUID serviceId;

    @Column(name = "preferred_barber_id")
    private UUID preferredBarberId;

    @Column(name = "window_start_at", nullable = false)
    private LocalDateTime windowStartAt;

    @Column(name = "window_end_at", nullable = false)
    private LocalDateTime windowEndAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WaitlistStatus status;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public WaitlistEntry() {
    }

    public WaitlistEntry(UUID tenantId, UUID unitId, UUID customerId, UUID serviceId, UUID preferredBarberId,
                          LocalDateTime windowStartAt, LocalDateTime windowEndAt, String notes) {
        this.tenantId = tenantId;
        this.unitId = unitId;
        this.customerId = customerId;
        this.serviceId = serviceId;
        this.preferredBarberId = preferredBarberId;
        this.windowStartAt = windowStartAt;
        this.windowEndAt = windowEndAt;
        this.notes = notes;
        this.status = WaitlistStatus.ACTIVE;
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

    public UUID getUnitId() {
        return unitId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public UUID getServiceId() {
        return serviceId;
    }

    public UUID getPreferredBarberId() {
        return preferredBarberId;
    }

    public LocalDateTime getWindowStartAt() {
        return windowStartAt;
    }

    public LocalDateTime getWindowEndAt() {
        return windowEndAt;
    }

    public WaitlistStatus getStatus() {
        return status;
    }

    public void setStatus(WaitlistStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
