CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    barber_id UUID NOT NULL REFERENCES barber_profiles(id),
    status VARCHAR(20) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    total_amount NUMERIC(19,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(19,2) NOT NULL DEFAULT 0,
    surcharge_amount NUMERIC(19,2) NOT NULL DEFAULT 0,
    tip_amount NUMERIC(19,2) NOT NULL DEFAULT 0,
    notes VARCHAR(1000),
    cancellation_reason VARCHAR(500),
    canceled_at TIMESTAMP,
    completed_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_appointments_tenant_id ON appointments(tenant_id);
CREATE INDEX idx_appointments_barber_start ON appointments(barber_id, start_at);
