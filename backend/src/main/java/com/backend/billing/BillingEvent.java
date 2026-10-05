package com.backend.billing;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Inbox persists identifiers only: no raw card or customer payload. */
@Entity
@Table(name = "billing_events")
public class BillingEvent {
    @Id @Column(length = 200) public String id;
    public String kind;
    public String resourceId;
    public boolean processed;
    public int attempts;
    public LocalDateTime receivedAt = LocalDateTime.now();
    public LocalDateTime nextAttemptAt = LocalDateTime.now();
    public LocalDateTime processedAt;
}
