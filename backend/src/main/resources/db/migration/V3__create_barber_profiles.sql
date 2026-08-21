CREATE TABLE barber_profiles(
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    barbershop_id UUID NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    bio TEXT,
    default_commission_percent INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30)NOT NULL DEFAULT 'ACTIVE',
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_barber_profiles_user
        UNIQUE (user_id),

    CONSTRAINT fk_barber_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_barber_profiles_barbershop
        FOREIGN KEY (barbershop_id) REFERENCES barbershops(id),

    CONSTRAINT chk_barber_commission
        CHECK (default_commission_percent BETWEEN 0 AND 100)
);

CREATE INDEX idx_barber_profiles_barbershop
    ON barber_profiles(barbershop_id);