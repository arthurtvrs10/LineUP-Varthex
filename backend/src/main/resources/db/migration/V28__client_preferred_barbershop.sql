ALTER TABLE users ADD COLUMN preferred_tenant_id UUID REFERENCES tenants(id);
