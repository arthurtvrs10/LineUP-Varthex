CREATE TABLE users (
    id UUID PRIMARY KEY UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    barbershop_id UUID,
    created_at TIMESTAMP NOT NULL,
    updated_At TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP
);