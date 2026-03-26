-- V2__seed_stores.sql
-- Seed the 4 FreshMart store locations

INSERT INTO stores (store_id, store_name, street, city, state, zip_code, phone) VALUES
    (101, 'Downtown', '123 Main St', 'Springfield', 'CO', '81001', '555-0101'),
    (102, 'Northside', '456 North Ave', 'Springfield', 'CO', '81002', '555-0102'),
    (103, 'Westside', '789 West Blvd', 'Springfield', 'CO', '81003', '555-0103'),
    (104, 'Riverside', '321 River Rd', 'Springfield', 'CO', '81004', '555-0104');

-- Seed a few suppliers
INSERT INTO suppliers (supplier_name, contact_name, phone, email) VALUES
    ('Dairy Best Farms', 'John Smith', '555-0201', 'orders@dairybest.com'),
    ('Bakery Fresh Co', 'Mary Johnson', '555-0202', 'sales@bakeryfresh.com'),
    ('Springfield Produce', 'Bob Williams', '555-0203', 'contact@sfproduce.com'),
    ('Household Goods Inc', 'Sarah Davis', '555-0204', 'orders@hhgoods.com');
