package com.backend.whatsapp;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/** Connection secrets are exposed only through the explicit, sanitized ConnectionView. */
public final class WhatsAppData {
    @Entity(name="WaConnection") @Table(name="wa_connections")
    public static class Connection {
        @Id public UUID tenantId;
        @Column(unique=true) public String phoneId;
        public String wabaId;
        @Column(length=8192) public String tokenEncrypted;
        @Column(length=8192) public String secretEncrypted;
        public String verifyHash;
        public String signupState;
        public Instant signupExpiresAt;
        public String mode="MANUAL";
        public String status="NOT_CONFIGURED";
        public String displayPhone;
        public String businessName;
        public String quality;
        public Instant testedAt;
        public Instant webhookAt;
        public boolean webhookVerified;
    }
    @Entity(name="WaTemplate") @Table(name="wa_templates",uniqueConstraints=@UniqueConstraint(columnNames={"tenant_id","meta_id"}))
    public static class Template {
        @Id public UUID id=UUID.randomUUID();
        public UUID tenantId;
        public String metaId;
        public String name;
        public String language;
        public String status;
        public String category;
        @Column(length=4096) public String body;
        public int parameterCount;
        public boolean supported;
        public Instant syncedAt;
    }
    @Entity(name="WaConsent") @Table(name="wa_consents",uniqueConstraints=@UniqueConstraint(columnNames={"tenant_id","phone"}))
    public static class Consent {
        @Id public UUID id=UUID.randomUUID();
        public UUID tenantId;
        public String phone;
        public boolean serviceAllowed;
        public boolean marketingAllowed;
        public boolean blocked;
        @Column(length=500) public String source;
        public UUID updatedBy;
        public Instant updatedAt;
    }
    @Entity(name="WaMessage") @Table(name="wa_messages",uniqueConstraints={@UniqueConstraint(columnNames={"tenant_id","request_key"}),@UniqueConstraint(columnNames={"tenant_id","meta_id"})})
    public static class Message {
        @Id public UUID id=UUID.randomUUID();
        public UUID tenantId;
        public String metaId;
        public String requestKey;
        public String phone;
        public UUID customerId;
        public UUID templateId;
        public UUID appointmentId;
        public UUID campaignId;
        public UUID automationId;
        public String direction="OUTBOUND";
        public String status="QUEUED";
        @Column(length=4096) public String body;
        @Column(length=8192) public String parametersJson="[]";
        public String errorCode;
        public boolean testMessage;
        public Instant createdAt=Instant.now();
        public Instant scheduledAt=Instant.now();
        public Instant sentAt;
        public Instant deliveredAt;
        public Instant readAt;
    }
    @Entity(name="WaAutomation") @Table(name="wa_automations")
    public static class Automation {
        @Id public UUID id=UUID.randomUUID();
        public UUID tenantId;
        public String name;
        public String triggerType;
        public UUID templateId;
        @Column(length=4096) public String variablesJson="[]";
        public boolean enabled;
        public Instant enabledAt;
    }
    @Entity(name="WaCampaign") @Table(name="wa_campaigns")
    public static class Campaign {
        @Id public UUID id=UUID.randomUUID();
        public UUID tenantId;
        public String name;
        public String requestKey;
        public Instant createdAt=Instant.now();
        public Instant scheduledAt;
        public int recipients;
    }
}
