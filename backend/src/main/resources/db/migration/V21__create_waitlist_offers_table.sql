CREATE TABLE waitlist_offers (
    id UUID PRIMARY KEY,
    waitlist_entry_id UUID NOT NULL REFERENCES waitlist_entries(id),
    barber_id UUID NOT NULL REFERENCES barber_profiles(id),
    slot_start_at TIMESTAMP NOT NULL,
    slot_end_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_waitlist_offers_entry ON waitlist_offers (waitlist_entry_id);
