CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    recipient_user_id UUID REFERENCES users(id),
    recipient_customer_id UUID REFERENCES customers(id),
    channel VARCHAR(20) NOT NULL,
    type VARCHAR(80) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(500) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    status VARCHAR(20) NOT NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT chk_notifications_recipient CHECK (
        recipient_user_id IS NOT NULL OR recipient_customer_id IS NOT NULL
    )
);

CREATE INDEX idx_notifications_recipient_user ON notifications (tenant_id, recipient_user_id, created_at DESC);
CREATE INDEX idx_notifications_recipient_customer ON notifications (tenant_id, recipient_customer_id, created_at DESC);
