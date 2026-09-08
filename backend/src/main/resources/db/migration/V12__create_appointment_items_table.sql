CREATE TABLE appointment_items (
    id UUID PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id),
    name VARCHAR(120) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    unit_price NUMERIC(19,2) NOT NULL,
    discount_amount NUMERIC(19,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_appointment_items_appointment_id ON appointment_items(appointment_id);
