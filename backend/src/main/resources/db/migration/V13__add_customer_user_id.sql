ALTER TABLE customers ADD COLUMN user_id UUID;

ALTER TABLE customers ADD CONSTRAINT uq_customers_user_id UNIQUE (user_id);

ALTER TABLE customers ADD CONSTRAINT fk_customers_user_id
    FOREIGN KEY (user_id) REFERENCES users (id);
