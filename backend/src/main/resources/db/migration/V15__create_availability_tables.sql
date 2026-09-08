CREATE TABLE work_schedules (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    barber_id UUID NOT NULL,
    weekday INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_work_schedules_barber ON work_schedules (barber_id, weekday);

CREATE TABLE availability_exceptions (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    barber_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_availability_exceptions_barber ON availability_exceptions (barber_id, starts_at, ends_at);
