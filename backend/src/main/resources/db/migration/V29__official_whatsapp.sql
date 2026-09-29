CREATE TABLE wa_connections (
 tenant_id UUID PRIMARY KEY REFERENCES tenants(id), phone_id VARCHAR(255) UNIQUE, waba_id VARCHAR(255),
 token_encrypted VARCHAR(8192), secret_encrypted VARCHAR(8192), verify_hash VARCHAR(255),
 signup_state VARCHAR(255), signup_expires_at TIMESTAMPTZ, mode VARCHAR(255), status VARCHAR(255),
 display_phone VARCHAR(255), business_name VARCHAR(255), quality VARCHAR(255), tested_at TIMESTAMPTZ,
 webhook_at TIMESTAMPTZ, webhook_verified BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE wa_templates (
 id UUID PRIMARY KEY, tenant_id UUID NOT NULL REFERENCES tenants(id), meta_id VARCHAR(255), name VARCHAR(255),
 language VARCHAR(255), status VARCHAR(255), category VARCHAR(255), body VARCHAR(4096),
 parameter_count INTEGER NOT NULL, supported BOOLEAN NOT NULL, synced_at TIMESTAMPTZ,
 UNIQUE(tenant_id,meta_id)
);
CREATE TABLE wa_consents (
 id UUID PRIMARY KEY, tenant_id UUID NOT NULL REFERENCES tenants(id), phone VARCHAR(255),
 service_allowed BOOLEAN NOT NULL, marketing_allowed BOOLEAN NOT NULL, blocked BOOLEAN NOT NULL,
 source VARCHAR(500), updated_by UUID, updated_at TIMESTAMPTZ, UNIQUE(tenant_id,phone)
);
CREATE TABLE wa_campaigns (
 id UUID PRIMARY KEY, tenant_id UUID NOT NULL REFERENCES tenants(id), name VARCHAR(255), request_key VARCHAR(255),
 created_at TIMESTAMPTZ, scheduled_at TIMESTAMPTZ, recipients INTEGER NOT NULL, UNIQUE(tenant_id,request_key)
);
CREATE TABLE wa_automations (
 id UUID PRIMARY KEY, tenant_id UUID NOT NULL REFERENCES tenants(id), name VARCHAR(255), trigger_type VARCHAR(255),
 template_id UUID REFERENCES wa_templates(id), variables_json VARCHAR(4096), enabled BOOLEAN NOT NULL, enabled_at TIMESTAMPTZ
);
CREATE TABLE wa_messages (
 id UUID PRIMARY KEY, tenant_id UUID NOT NULL REFERENCES tenants(id), meta_id VARCHAR(255), request_key VARCHAR(255),
 phone VARCHAR(255), customer_id UUID REFERENCES customers(id), template_id UUID REFERENCES wa_templates(id),
 appointment_id UUID REFERENCES appointments(id), campaign_id UUID REFERENCES wa_campaigns(id), automation_id UUID REFERENCES wa_automations(id),
 direction VARCHAR(255), status VARCHAR(255), body VARCHAR(4096), parameters_json VARCHAR(8192), error_code VARCHAR(255),
 test_message BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ, scheduled_at TIMESTAMPTZ, sent_at TIMESTAMPTZ,
 delivered_at TIMESTAMPTZ, read_at TIMESTAMPTZ, UNIQUE(tenant_id,request_key), UNIQUE(tenant_id,meta_id)
);
CREATE INDEX ix_wa_messages_queue ON wa_messages(status,scheduled_at);
CREATE INDEX ix_wa_messages_tenant_phone ON wa_messages(tenant_id,phone,created_at);
