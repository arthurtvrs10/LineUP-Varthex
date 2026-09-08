ALTER TABLE users DROP COLUMN barbershop_id;
ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id);

ALTER TABLE barber_profiles DROP COLUMN barbershop_id;
ALTER TABLE barber_profiles ADD COLUMN unit_id UUID NOT NULL REFERENCES units(id);

DROP TABLE barbershops;
