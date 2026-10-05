package com.backend.googlecalendar;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

public final class GoogleCalendarData {
    @Entity(name="GcConnection") @Table(name="gc_connections", uniqueConstraints=@UniqueConstraint(columnNames={"owner_type","owner_id"}))
    public static class Connection {
        @Id public UUID id=UUID.randomUUID();
        @Column(name="owner_type",nullable=false,length=20) public String ownerType;
        @Column(name="owner_id",nullable=false) public UUID ownerId;
        public UUID tenantId;
        @Column(length=8192) public String accessEncrypted;
        @Column(length=8192) public String refreshEncrypted;
        public Instant accessExpiresAt;
        @Column(length=320) public String googleEmail;
        @Column(length=500) public String calendarId;
        @Column(length=500) public String calendarSummary;
        @Column(length=40) public String status="DISCONNECTED";
        @Column(length=500) public String lastError;
        public Instant lastSyncAt;
        public Instant stateExpiresAt;
        @Column(name="state_hash",length=128) public String stateHash;
        @Column(name="return_to",length=160) public String returnTo;
        public UUID initiatedBy;
        public boolean enabled;
        public Instant createdAt=Instant.now();
    }
    @Entity(name="GcEventSync") @Table(name="gc_event_syncs", uniqueConstraints=@UniqueConstraint(columnNames={"tenant_id","appointment_id"}), indexes=@Index(columnList="status,next_attempt_at"))
    public static class EventSync {
        @Id public UUID id=UUID.randomUUID();
        public UUID tenantId;
        public UUID appointmentId;
        public UUID connectionId;
        public UUID previousConnectionId;
        @Column(length=255) public String eventId;
        @Column(length=500) public String calendarId;
        @Column(length=500) public String eventCalendarId;
        @Column(length=20) public String operation="UPSERT";
        @Column(length=30) public String status="QUEUED";
        @Column(length=500) public String lastError;
        public int attempts;
        public Instant nextAttemptAt=Instant.now();
        public Instant updatedAt=Instant.now();
    }
}
