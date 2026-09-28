ALTER TABLE customers DROP CONSTRAINT uq_customers_user_id;
ALTER TABLE customers ADD CONSTRAINT uq_customers_tenant_user UNIQUE (tenant_id, user_id);
