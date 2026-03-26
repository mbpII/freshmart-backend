-- V1__init_schema.sql
-- FreshMart Inventory System - Initial Schema

-- Stores (4 locations as specified: 101-104)
CREATE TABLE stores (
    store_id SMALLINT PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    street VARCHAR(200),
    city VARCHAR(100) DEFAULT 'Springfield',
    state VARCHAR(2) DEFAULT 'CO',
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products (shared catalog per requirements)
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    upc VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(supplier_id),
    unit_cost DECIMAL(10, 2),
    retail_price DECIMAL(10, 2) NOT NULL,
    is_on_sale BOOLEAN DEFAULT FALSE,
    sale_price DECIMAL(10, 2),
    expiration_date DATE,
    reorder_threshold INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    is_food BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Per-store inventory (per requirements EPIC-06-02)
CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    store_id SMALLINT NOT NULL REFERENCES stores(store_id),
    quantity_on_hand INTEGER DEFAULT 0 NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(product_id, store_id)
);

-- Transaction history (RECEIVE, SALE, ADJUSTMENT per requirements)
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    store_id SMALLINT NOT NULL REFERENCES stores(store_id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('RECEIVE', 'SALE', 'ADJUSTMENT')),
    quantity_change INTEGER NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts (EPIC-02, EPIC-04)
CREATE TABLE alerts (
    alert_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    store_id SMALLINT NOT NULL REFERENCES stores(store_id),
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('LOW_STOCK', 'EXPIRING')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    message TEXT NOT NULL,
    suggested_discount INTEGER,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dismissed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_inventory_store ON inventory(store_id, is_active);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_transactions_store_date ON transactions(store_id, transaction_date);
CREATE INDEX idx_transactions_product ON transactions(product_id);
CREATE INDEX idx_alerts_store_active ON alerts(store_id, is_dismissed, created_at);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_upc ON products(upc);

-- Trigger to update products.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
