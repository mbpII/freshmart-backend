-- sales_price_modifier is the store-scoped source of truth for sale state.

DROP INDEX IF EXISTS idx_inventory_store_sale_active;

ALTER TABLE inventory
    DROP COLUMN IF EXISTS is_on_sale;
