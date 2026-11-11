ALTER TABLE users ADD COLUMN email_verification_required BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE email_verification_tokens (
 user_id UUID PRIMARY KEY REFERENCES users(id),
 token_hash VARCHAR(64) NOT NULL UNIQUE,
 expires_at TIMESTAMP NOT NULL,
 sent_at TIMESTAMP NOT NULL,
 used_at TIMESTAMP
);
