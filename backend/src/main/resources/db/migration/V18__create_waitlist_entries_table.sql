CREATE TABLE waitlist_entries (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    service_id UUID NOT NULL REFERENCES services(id),
    preferred_barber_id UUID REFERENCES barber_profiles(id),
    window_start_at TIMESTAMP NOT NULL,
    window_end_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_waitlist_entries_tenant_status ON waitlist_entries (tenant_id, status, created_at);
CREATE INDEX idx_waitlist_entries_customer ON waitlist_entries (customer_id);
