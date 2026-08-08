package com.backend.barbershops;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "barbershop")
public class Barbershop {

    @Id
    private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private BusinessDocumentType documentType;

    private String documentNumber;

    private String phone;

    private String email;

    @Enumerated(EnumType.STRING)
    private BarbershopStatus status;

    private String timezone;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Barbershop(){

    }

    public Barbershop(UUID id, String name, BusinessDocumentType documentType,
                      String documentNumber, String phone, String email, BarbershopStatus status,
                      String timezone, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.phone = phone;
        this.email = email;
        this.status = status;
        this.timezone = timezone;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    public void prePersist() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = BarbershopStatus.TRIAL;
        }

        if (this.timezone == null) {
            this.timezone = "America/Sao_Paulo";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BusinessDocumentType getDocumentType() {
        return documentType;
    }

    public String getDocumentNumber() {
        return documentNumber;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public BarbershopStatus getStatus() {
        return status;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setStatus(BarbershopStatus status) {
        this.status = status;
    }
}
