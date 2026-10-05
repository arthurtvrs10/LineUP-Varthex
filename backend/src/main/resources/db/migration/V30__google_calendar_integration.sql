CREATE TABLE gc_connections (
 id UUID PRIMARY KEY, owner_type VARCHAR(20) NOT NULL, owner_id UUID NOT NULL, tenant_id UUID NOT NULL REFERENCES tenants(id),
 access_encrypted VARCHAR(8192), refresh_encrypted VARCHAR(8192), access_expires_at TIMESTAMPTZ,
 google_email VARCHAR(320), calendar_id VARCHAR(500), calendar_summary VARCHAR(500), status VARCHAR(40) NOT NULL,
 last_error VARCHAR(500), last_sync_at TIMESTAMPTZ, state_expires_at TIMESTAMPTZ, state_hash VARCHAR(128),
 return_to VARCHAR(160), initiated_by UUID, enabled BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL,
 CONSTRAINT uq_gc_owner UNIQUE(owner_type,owner_id), CONSTRAINT ck_gc_owner_type CHECK(owner_type IN ('TENANT','BARBER'))
);
CREATE INDEX ix_gc_connections_tenant ON gc_connections(tenant_id);
CREATE TABLE gc_event_syncs (
 id UUID PRIMARY KEY, tenant_id UUID NOT NULL REFERENCES tenants(id), appointment_id UUID NOT NULL REFERENCES appointments(id),
 connection_id UUID NOT NULL REFERENCES gc_connections(id), previous_connection_id UUID REFERENCES gc_connections(id), event_id VARCHAR(255), calendar_id VARCHAR(500), event_calendar_id VARCHAR(500), operation VARCHAR(20) NOT NULL,
 status VARCHAR(30) NOT NULL, last_error VARCHAR(500), attempts INTEGER NOT NULL DEFAULT 0,
 next_attempt_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL,
 CONSTRAINT uq_gc_appointment UNIQUE(tenant_id,appointment_id)
);
CREATE INDEX ix_gc_event_queue ON gc_event_syncs(status,next_attempt_at);
