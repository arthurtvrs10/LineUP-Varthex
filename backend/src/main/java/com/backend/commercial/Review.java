package com.backend.commercial;

import jakarta.persistence.*;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_reviews")
public class Review {
    @Id
    public UUID id = UUID.randomUUID();
    @Version
    public Long version;
    @Column(name = "tenant_id")
    public UUID tenantId;
    @Column(name = "appointment_id")
    public UUID appointmentId;
    @Column(name = "customer_id")
    public UUID customerId;
    @Column(name = "rating")
    public Integer rating;
    @Column(name = "comment", length = 1000)
    public String comment;
    @Column(name = "reply", length = 1000)
    public String reply;
    @Column(name = "created_at")
    public LocalDateTime createdAt;
}
