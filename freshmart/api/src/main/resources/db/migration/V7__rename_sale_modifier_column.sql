-- V7__rename_sale_modifier_column.sql
-- Rename store-scoped sale modifier column for clearer naming.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'inventory'
          AND column_name = 'sale_percent_off'
    ) THEN
        ALTER TABLE inventory RENAME COLUMN sale_percent_off TO sales_price_modifier;
    END IF;
END $$;
