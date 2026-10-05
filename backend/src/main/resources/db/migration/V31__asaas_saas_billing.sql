CREATE TABLE billing_accounts (
    id uuid PRIMARY KEY, version bigint NOT NULL DEFAULT 0,
    tenant_id uuid NOT NULL UNIQUE REFERENCES tenants(id), plan_id uuid REFERENCES saas_plans(id), actor_id uuid,
    monthly_price numeric(19,2), customer_id varchar(255) UNIQUE,
    provider_subscription_id varchar(255) UNIQUE, checkout_id varchar(255) UNIQUE,
    checkout_url varchar(1000), method varchar(255), state varchar(255), request_key varchar(255), request_fingerprint varchar(255),
    cancel_requested boolean NOT NULL DEFAULT false, checkout_expires_at timestamp,
    created_at timestamp, synced_at timestamp, issue varchar(1000)
);
CREATE TABLE billing_charges (
    id uuid PRIMARY KEY, version bigint NOT NULL DEFAULT 0,
    account_id uuid NOT NULL REFERENCES billing_accounts(id), provider_id varchar(255) NOT NULL UNIQUE,
    status varchar(255), failure_code varchar(255), due_date date, payment_date date, available_on date,
    gross numeric(19,2), net numeric(19,2), refunded numeric(19,2), invoice_url varchar(1000),
    refund_state varchar(255), refund_key varchar(255), refund_amount numeric(19,2),
    refund_baseline numeric(19,2), refund_reason varchar(1000), updated_at timestamp,
    notice_status varchar(255), notice_email_sent boolean NOT NULL DEFAULT false
);
CREATE INDEX ix_billing_charges_account ON billing_charges(account_id);
CREATE TABLE billing_events (
    id varchar(200) PRIMARY KEY, kind varchar(255), resource_id varchar(255),
    processed boolean NOT NULL DEFAULT false, attempts integer NOT NULL DEFAULT 0,
    received_at timestamp, next_attempt_at timestamp, processed_at timestamp
);
CREATE INDEX ix_billing_events_pending ON billing_events(processed, next_attempt_at, received_at);
