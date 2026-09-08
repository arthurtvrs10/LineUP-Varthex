package com.backend.waitlist;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "waitlist_offers")
public class WaitlistOffer {

    @Id
    private UUID id;

    @Column(name = "waitlist_entry_id", nullable = false)
    private UUID waitlistEntryId;

    @Column(name = "barber_id", nullable = false)
    private UUID barberId;

    @Column(name = "slot_start_at", nullable = false)
    private LocalDateTime slotStartAt;

    @Column(name = "slot_end_at", nullable = false)
    private LocalDateTime slotEndAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WaitlistOfferStatus status;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public WaitlistOffer() {
    }

    public WaitlistOffer(UUID waitlistEntryId, UUID barberId, LocalDateTime slotStartAt,
                          LocalDateTime slotEndAt, LocalDateTime expiresAt) {
        this.waitlistEntryId = waitlistEntryId;
        this.barberId = barberId;
        this.slotStartAt = slotStartAt;
        this.slotEndAt = slotEndAt;
        this.status = WaitlistOfferStatus.PENDING;
        this.expiresAt = expiresAt;
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

    public UUID getWaitlistEntryId() {
        return waitlistEntryId;
    }

    public UUID getBarberId() {
        return barberId;
    }

    public LocalDateTime getSlotStartAt() {
        return slotStartAt;
    }

    public LocalDateTime getSlotEndAt() {
        return slotEndAt;
    }

    public WaitlistOfferStatus getStatus() {
        return status;
    }

    public void setStatus(WaitlistOfferStatus status) {
        this.status = status;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // Sem job em background pra varrer e marcar EXPIRED — expiração é
    // calculada na hora (accept/leitura), simplificação documentada.
    public boolean isPending() {
        return status == WaitlistOfferStatus.PENDING && expiresAt.isAfter(LocalDateTime.now());
    }
}
