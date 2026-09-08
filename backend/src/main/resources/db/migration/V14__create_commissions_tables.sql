CREATE TABLE commission_rules (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    barber_id UUID,
    service_id UUID,
    type VARCHAR(20) NOT NULL,
    percentage NUMERIC(7,4),
    fixed_amount NUMERIC(19,2),
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_commission_rules_tenant ON commission_rules (tenant_id);
CREATE INDEX idx_commission_rules_barber ON commission_rules (barber_id);

CREATE TABLE commission_entries (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    appointment_id UUID,
    appointment_item_id UUID,
    barber_id UUID NOT NULL,
    commission_rule_id UUID,
    base_amount NUMERIC(19,2) NOT NULL,
    percentage NUMERIC(7,4) NOT NULL DEFAULT 0,
    fixed_amount NUMERIC(19,2) NOT NULL DEFAULT 0,
    commission_amount NUMERIC(19,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    reversal_of_id UUID,
    reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_commission_entries_tenant_barber_created ON commission_entries (tenant_id, barber_id, created_at);
CREATE INDEX idx_commission_entries_appointment ON commission_entries (appointment_id);
