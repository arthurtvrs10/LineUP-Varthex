CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    trade_name VARCHAR(120) NOT NULL,
    legal_name VARCHAR(180),
    document VARCHAR(14),
    status VARCHAR(20) NOT NULL,
    default_time_zone VARCHAR(50) NOT NULL,
    locale VARCHAR(10) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    logo_url VARCHAR(500),
    slug VARCHAR(160) UNIQUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
