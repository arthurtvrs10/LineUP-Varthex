package com.backend.availability;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

// weekday: 0 = segunda ... 6 = domingo (mesma convenção usada no front,
// ver frontend/components/clientes/agendamento/dados.ts).
@Entity
@Table(name = "work_schedules")
public class WorkSchedule {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "barber_id", nullable = false)
    private UUID barberId;

    @Column(nullable = false)
    private int weekday;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public WorkSchedule() {
    }

    public WorkSchedule(UUID tenantId, UUID barberId, int weekday, LocalTime startTime, LocalTime endTime) {
        this.tenantId = tenantId;
        this.barberId = barberId;
        this.weekday = weekday;
        this.startTime = startTime;
        this.endTime = endTime;
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

    public UUID getId() {
        return id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public UUID getBarberId() {
        return barberId;
    }

    public int getWeekday() {
        return weekday;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public Long getVersion() {
        return version;
    }
}
