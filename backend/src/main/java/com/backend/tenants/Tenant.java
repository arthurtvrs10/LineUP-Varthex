package com.backend.tenants;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class Tenant {

    @Id
    private UUID id;

    @Column(name = "trade_name", nullable = false, length = 120)
    private String tradeName;

    @Column(name = "legal_name", length = 180)
    private String legalName;

    @Column(length = 14)
    private String document;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TenantStatus status;

    @Column(name = "default_time_zone", nullable = false, length = 50)
    private String defaultTimeZone;

    @Column(nullable = false, length = 10)
    private String locale;

    @Column(nullable = false, length = 3)
    private String currency;

    private String email;

    private String phone;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(length = 160, unique = true)
    private String slug;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Tenant() {
    }

    public Tenant(UUID id, String tradeName, String legalName, String document,
                  String defaultTimeZone, String locale, String currency,
                  String email, String phone) {
        this.id = id;
        this.tradeName = tradeName;
        this.legalName = legalName;
        this.document = document;
        this.defaultTimeZone = defaultTimeZone;
        this.locale = locale;
        this.currency = currency;
        this.email = email;
        this.phone = phone;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }

        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = TenantStatus.TRIAL;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public String getTradeName() {
        return tradeName;
    }

    public void setTradeName(String tradeName) {
        this.tradeName = tradeName;
    }

    public String getLegalName() {
        return legalName;
    }

    public void setLegalName(String legalName) {
        this.legalName = legalName;
    }

    public String getDocument() {
        return document;
    }

    public void setDocument(String document) {
        this.document = document;
    }

    public TenantStatus getStatus() {
        return status;
    }

    public void setStatus(TenantStatus status) {
        this.status = status;
    }

    public String getDefaultTimeZone() {
        return defaultTimeZone;
    }

    public void setDefaultTimeZone(String defaultTimeZone) {
        this.defaultTimeZone = defaultTimeZone;
    }

    public String getLocale() {
        return locale;
    }

    public String getCurrency() {
        return currency;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getSlug() {
        return slug;
    }

    public Long getVersion() {
        return version;
    }
}
