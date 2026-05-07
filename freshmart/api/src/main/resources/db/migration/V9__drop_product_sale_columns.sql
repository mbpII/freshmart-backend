-- Sale state is store-scoped on inventory; remove legacy product-level sale fields.

ALTER TABLE products
    DROP COLUMN IF EXISTS is_on_sale,
    DROP COLUMN IF EXISTS sale_price;
