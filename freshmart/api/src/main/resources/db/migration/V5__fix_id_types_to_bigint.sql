-- V5__fix_id_types_to_bigint.sql
-- Align all ID columns with JPA Long type (BIGINT)

-- inventory
ALTER TABLE inventory ALTER COLUMN inventory_id TYPE BIGINT;
ALTER TABLE inventory ALTER COLUMN product_id TYPE BIGINT;
ALTER TABLE inventory ALTER COLUMN store_id TYPE BIGINT;

-- products
ALTER TABLE products ALTER COLUMN product_id TYPE BIGINT;
ALTER TABLE products ALTER COLUMN supplier_id TYPE BIGINT;

-- suppliers
ALTER TABLE suppliers ALTER COLUMN supplier_id TYPE BIGINT;

-- transactions
ALTER TABLE transactions ALTER COLUMN transaction_id TYPE BIGINT;
ALTER TABLE transactions ALTER COLUMN product_id TYPE BIGINT;
ALTER TABLE transactions ALTER COLUMN store_id TYPE BIGINT;
ALTER TABLE transactions ALTER COLUMN user_id TYPE BIGINT;

-- users
ALTER TABLE users ALTER COLUMN user_id TYPE BIGINT;
ALTER TABLE users ALTER COLUMN assigned_store_id TYPE BIGINT;

-- stores
ALTER TABLE stores ALTER COLUMN store_id TYPE BIGINT;

-- Recreate indexes after type change (dropped/recreated automatically by Postgres for FK columns)
CREATE INDEX IF NOT EXISTS idx_inventory_store ON inventory(store_id, is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_store_date ON transactions(store_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_store ON users(assigned_store_id);