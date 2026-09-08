package com.backend.notifications;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

// Só controla o canal EMAIL — a notificação in-app é sempre leve o
// suficiente pra não precisar de opt-out neste incremento (RF-NOT-004).
// Ausência de linha = habilitado (modelo opt-out, não opt-in).
@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 80)
    private NotificationType type;

    @Column(name = "email_enabled", nullable = false)
    private boolean emailEnabled;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public NotificationPreference() {
    }

    public NotificationPreference(UUID userId, NotificationType type, boolean emailEnabled) {
        this.userId = userId;
        this.type = type;
        this.emailEnabled = emailEnabled;
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

    public UUID getUserId() {
        return userId;
    }

    public NotificationType getType() {
        return type;
    }

    public boolean isEmailEnabled() {
        return emailEnabled;
    }

    public void setEmailEnabled(boolean emailEnabled) {
        this.emailEnabled = emailEnabled;
    }
}
