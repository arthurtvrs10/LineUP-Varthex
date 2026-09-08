package com.backend.availability;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "availability_exceptions")
public class AvailabilityException {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "barber_id", nullable = false)
    private UUID barberId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AvailabilityExceptionType type;

    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt;

    @Column(name = "ends_at", nullable = false)
    private LocalDateTime endsAt;

    @Column(length = 500)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public AvailabilityException() {
    }

    public AvailabilityException(UUID tenantId, UUID barberId, AvailabilityExceptionType type,
                                  LocalDateTime startsAt, LocalDateTime endsAt, String reason) {
        this.tenantId = tenantId;
        this.barberId = barberId;
        this.type = type;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
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

    public UUID getBarberId() {
        return barberId;
    }

    public AvailabilityExceptionType getType() {
        return type;
    }

    public LocalDateTime getStartsAt() {
        return startsAt;
    }

    public LocalDateTime getEndsAt() {
        return endsAt;
    }

    public String getReason() {
        return reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
