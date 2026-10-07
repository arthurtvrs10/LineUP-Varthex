CREATE TABLE billing_terms (
 id UUID PRIMARY KEY, version BIGINT,
 account_id UUID NOT NULL REFERENCES billing_accounts(id),
 plan_id UUID NOT NULL, plan_name VARCHAR(255), addon_id UUID, addon_name VARCHAR(255),
 addon_quantity INTEGER NOT NULL DEFAULT 0, base_price NUMERIC(19,2), addon_unit_price NUMERIC(19,2),
 monthly_price NUMERIC(19,2) NOT NULL, barber_limit INTEGER NOT NULL,
 method VARCHAR(255) NOT NULL, effective_on DATE NOT NULL, state VARCHAR(255) NOT NULL,
 expires_at TIMESTAMP, created_at TIMESTAMP NOT NULL
);
CREATE INDEX billing_terms_account_date ON billing_terms(account_id,effective_on);
ALTER TABLE billing_charges ADD COLUMN terms_id UUID REFERENCES billing_terms(id);
