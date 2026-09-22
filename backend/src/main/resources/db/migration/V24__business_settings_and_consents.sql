CREATE TABLE business_settings (
 tenant_id uuid PRIMARY KEY REFERENCES tenants(id), version bigint NOT NULL DEFAULT 0,
 minimum_notice_hours integer NOT NULL DEFAULT 0,
 cancellation_notice_hours integer NOT NULL DEFAULT 0,
 default_commission_percent integer NOT NULL DEFAULT 40,
 staff_notifications boolean NOT NULL DEFAULT true,
 CONSTRAINT ck_business_settings CHECK (minimum_notice_hours BETWEEN 0 AND 720 AND cancellation_notice_hours BETWEEN 0 AND 720 AND default_commission_percent BETWEEN 0 AND 100)
);
CREATE TABLE communication_consents (
 user_id uuid PRIMARY KEY REFERENCES users(id), version bigint NOT NULL DEFAULT 0,
 marketing boolean NOT NULL DEFAULT false, updated_at timestamp NOT NULL
);
