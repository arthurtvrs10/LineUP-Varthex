CREATE TABLE services (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    unit_id UUID REFERENCES units(id),
    category_id UUID REFERENCES service_categories(id),
    service_type VARCHAR(20) NOT NULL,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(1000),
    duration_minutes INTEGER NOT NULL,
    buffer_before_minutes INTEGER NOT NULL,
    buffer_after_minutes INTEGER NOT NULL,
    price NUMERIC(19,2) NOT NULL,
    sort_order INTEGER NOT NULL,
    active BOOLEAN NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_services_tenant_id ON services(tenant_id);
