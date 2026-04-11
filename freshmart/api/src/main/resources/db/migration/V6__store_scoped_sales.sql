-- V6__store_scoped_sales.sql
-- Move sale state from shared product catalog to per-store inventory.

ALTER TABLE inventory
    ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS sale_percent_off DECIMAL(5, 2);

-- Backfill inventory sale state from legacy product-level fields.
UPDATE inventory i
SET
    is_on_sale = COALESCE(p.is_on_sale, FALSE),
    sale_percent_off = CASE
        WHEN COALESCE(p.is_on_sale, FALSE) = TRUE
             AND p.sale_price IS NOT NULL
             AND p.retail_price IS NOT NULL
             AND p.retail_price > 0
        THEN ROUND(((p.retail_price - p.sale_price) / p.retail_price) * 100, 2)
        ELSE NULL
    END
FROM products p
WHERE p.product_id = i.product_id;

-- Normalize invalid historical values.
UPDATE inventory
SET is_on_sale = FALSE, sale_percent_off = NULL
WHERE sale_percent_off IS NULL OR sale_percent_off <= 0 OR sale_percent_off >= 100;

CREATE INDEX IF NOT EXISTS idx_inventory_store_sale_active
    ON inventory(store_id, is_active, is_on_sale);
