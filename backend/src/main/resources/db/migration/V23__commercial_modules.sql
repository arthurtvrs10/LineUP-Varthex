-- Commercial data: append-only ledgers; tenant-scoped access is enforced by services.
CREATE TABLE cash_registers (
    id uuid PRIMARY KEY,
    version bigint NOT NULL DEFAULT 0,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    opened_by uuid,
    opened_at timestamp,
    opening_amount numeric(19,2),
    closed_at timestamp,
    expected_amount numeric(19,2),
    counted_amount numeric(19,2),
    closing_reason varchar(1000)
);
CREATE INDEX ix_cash_registers_tenant ON cash_registers(tenant_id);
CREATE TABLE commercial_payments (
    id uuid PRIMARY KEY,
    version bigint NOT NULL DEFAULT 0,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    register_id uuid,
    product_id uuid,
    quantity integer,
    appointment_id uuid,
    amount numeric(19,2),
    method varchar(1000),
    kind varchar(1000),
    reason varchar(1000),
    reversal_of uuid,
    request_key varchar(1000),
    created_by uuid,
    created_at timestamp
);
CREATE INDEX ix_commercial_payments_tenant ON commercial_payments(tenant_id);
CREATE TABLE products (
    id uuid PRIMARY KEY,
    version bigint NOT NULL DEFAULT 0,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    name varchar(1000),
    sku varchar(1000),
    category varchar(1000),
    supplier varchar(1000),
    cost numeric(19,2),
    price numeric(19,2),
    minimum_stock integer,
    active boolean
);
CREATE INDEX ix_products_tenant ON products(tenant_id);
CREATE TABLE stock_movements (
    id uuid PRIMARY KEY,
    version bigint NOT NULL DEFAULT 0,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    product_id uuid,
    quantity integer,
    kind varchar(1000),
    reason varchar(1000),
    request_key varchar(1000),
    created_by uuid,
    created_at timestamp
);
CREATE INDEX ix_stock_movements_tenant ON stock_movements(tenant_id);
CREATE TABLE loyalty_movements (
    id uuid PRIMARY KEY,
    version bigint NOT NULL DEFAULT 0,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    customer_id uuid,
    points integer,
    reason varchar(1000),
    payment_id uuid,
    request_key varchar(1000),
    created_by uuid,
    created_at timestamp
);
CREATE INDEX ix_loyalty_movements_tenant ON loyalty_movements(tenant_id);
CREATE TABLE customer_reviews (
    id uuid PRIMARY KEY,
    version bigint NOT NULL DEFAULT 0,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    appointment_id uuid,
    customer_id uuid,
    rating integer,
    comment varchar(1000),
    reply varchar(1000),
    created_at timestamp
);
CREATE INDEX ix_customer_reviews_tenant ON customer_reviews(tenant_id);
CREATE TABLE crm_campaigns (
    id uuid PRIMARY KEY,
    version bigint NOT NULL DEFAULT 0,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    name varchar(1000),
    segment varchar(1000),
    message varchar(1000),
    status varchar(1000),
    created_at timestamp
);
CREATE INDEX ix_crm_campaigns_tenant ON crm_campaigns(tenant_id);
CREATE TABLE saas_plans (
    id uuid PRIMARY KEY,
    version bigint NOT NULL DEFAULT 0,
    name varchar(1000),
    monthly_price numeric(19,2),
    barber_limit integer,
    active boolean,
    created_at timestamp
);
CREATE TABLE saas_subscriptions (
    id uuid PRIMARY KEY,
    version bigint NOT NULL DEFAULT 0,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    plan_id uuid,
    status varchar(1000),
    starts_on date,
    ends_on date,
    reason varchar(1000)
);
CREATE INDEX ix_saas_subscriptions_tenant ON saas_subscriptions(tenant_id);
CREATE TABLE commercial_audit_events (
    id uuid PRIMARY KEY,
    version bigint NOT NULL DEFAULT 0,
    tenant_id uuid REFERENCES tenants(id),
    actor_id uuid,
    action varchar(1000),
    target_id uuid,
    created_at timestamp
);
CREATE INDEX ix_commercial_audit_events_tenant ON commercial_audit_events(tenant_id);
CREATE UNIQUE INDEX ux_product_sku ON products(tenant_id, sku);
CREATE UNIQUE INDEX ux_payment_request ON commercial_payments(tenant_id, request_key);
CREATE UNIQUE INDEX ux_stock_request ON stock_movements(tenant_id, request_key);
CREATE UNIQUE INDEX ux_loyalty_request ON loyalty_movements(tenant_id, request_key);
CREATE UNIQUE INDEX ux_review_appointment ON customer_reviews(tenant_id, appointment_id);
CREATE UNIQUE INDEX ux_subscription_tenant ON saas_subscriptions(tenant_id);
CREATE UNIQUE INDEX ux_payment_reversal ON commercial_payments(reversal_of);
CREATE UNIQUE INDEX ux_register_open ON cash_registers(tenant_id) WHERE closed_at IS NULL;
ALTER TABLE commercial_payments ADD CONSTRAINT fk_payment_register FOREIGN KEY (register_id) REFERENCES cash_registers(id);
ALTER TABLE commercial_payments ADD CONSTRAINT fk_payment_product FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE stock_movements ADD CONSTRAINT fk_stock_product FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE saas_subscriptions ADD CONSTRAINT fk_subscription_plan FOREIGN KEY (plan_id) REFERENCES saas_plans(id);
ALTER TABLE products ADD CONSTRAINT ck_product_prices CHECK (cost >= 0 AND price >= 0 AND minimum_stock >= 0);
ALTER TABLE customer_reviews ADD CONSTRAINT ck_review_rating CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE saas_plans ADD CONSTRAINT ck_plan_values CHECK (monthly_price >= 0 AND barber_limit > 0);

ALTER TABLE commercial_audit_events ADD COLUMN detail varchar(4000);
