CREATE TABLE billing_addons (
    id UUID PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES saas_plans(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    monthly_price NUMERIC(19,2) NOT NULL CHECK (monthly_price > 0),
    max_quantity INTEGER NOT NULL CHECK (max_quantity > 0),
    active BOOLEAN NOT NULL DEFAULT FALSE
);
INSERT INTO billing_addons (id, plan_id, name, code, monthly_price, max_quantity, active)
VALUES ('2a110000-0000-4000-8000-000000000003', '2a110000-0000-4000-8000-000000000002',
        'Profissional extra', 'BARBER_SEAT', 19.90, 20, TRUE);

ALTER TABLE billing_accounts ADD COLUMN environment VARCHAR(255);
ALTER TABLE billing_accounts ADD COLUMN base_price NUMERIC(19,2);
ALTER TABLE billing_accounts ADD COLUMN addon_id UUID;
ALTER TABLE billing_accounts ADD COLUMN addon_name VARCHAR(255);
ALTER TABLE billing_accounts ADD COLUMN addon_unit_price NUMERIC(19,2);
ALTER TABLE billing_accounts ADD COLUMN addon_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE billing_accounts ADD COLUMN contracted_barber_limit INTEGER;
ALTER TABLE saas_subscriptions ADD COLUMN barber_limit INTEGER;
-- Existing provider accounts remain unclassified: reconcile with their original
-- environment before any external mutation; never guess sandbox vs production.
