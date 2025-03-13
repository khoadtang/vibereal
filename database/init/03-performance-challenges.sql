-- Set search path
SET search_path TO ecommerce, public;

-- CHALLENGE 1: Missing index on email lookup
-- Problem: User lookups by email are slow
-- The following query is slow:
-- EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john.doe@example.com';
-- Solution: Create an index on email
-- CREATE INDEX idx_users_email ON users(email);

-- CHALLENGE 2: Missing product category index
-- Problem: Product filtering by category is slow
-- The following query is slow:
-- EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = 2;
-- Solution: Create an index on category_id
-- CREATE INDEX idx_products_category_id ON products(category_id);

-- CHALLENGE 3: Missing order status index
-- Problem: Order filtering by status is slow
-- The following query is slow:
-- EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending';
-- Solution: Create an index on status
-- CREATE INDEX idx_orders_status ON orders(status);

-- CHALLENGE 4: Missing order_items foreign keys and indexes
-- Problem: Joining order_items with orders and products is slow
-- The following query is slow:
-- EXPLAIN ANALYZE SELECT o.id, p.name, oi.quantity FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE o.status = 'completed';
-- Solution: Add foreign keys and indexes
-- ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders(id);
-- ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product_id FOREIGN KEY (product_id) REFERENCES products(id);
-- CREATE INDEX idx_order_items_order_id ON order_items(order_id);
-- CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- CHALLENGE 5: Cart items missing indexes
-- Problem: Shopping cart retrieval is slow
-- The following query is slow:
-- EXPLAIN ANALYZE SELECT p.name, p.price, ci.quantity FROM shopping_cart sc JOIN cart_items ci ON sc.id = ci.cart_id JOIN products p ON p.id = ci.product_id WHERE sc.user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
-- Solution: Add indexes
-- CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
-- CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- CHALLENGE 6: Text search on product descriptions
-- Problem: Text search on product descriptions is slow
-- The following query is slow:
-- EXPLAIN ANALYZE SELECT * FROM products WHERE description ILIKE '%laptop%';
-- Solution: Create a GIN index for text search
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX idx_products_description_trgm ON products USING gin(description gin_trgm_ops);

-- CHALLENGE 7: Slow aggregation query
-- Problem: Sales reporting query is slow
-- The following query is slow:
-- EXPLAIN ANALYZE SELECT p.category_id, c.name, SUM(oi.quantity * oi.unit_price) as revenue FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id JOIN categories c ON c.id = p.category_id WHERE o.created_at > '2023-01-01' GROUP BY p.category_id, c.name;
-- Solution: Add indexes to support the query
-- CREATE INDEX idx_orders_created_at ON orders(created_at);
-- CREATE INDEX idx_products_category_id ON products(category_id);

-- CHALLENGE 8: Slow product array search
-- Problem: Searching products by tags is slow
-- The following query is slow:
-- EXPLAIN ANALYZE SELECT * FROM products WHERE 'laptop' = ANY(tags);
-- Solution: Create a GIN index for array column
-- CREATE INDEX idx_products_tags ON products USING gin(tags);

-- CHALLENGE 9: Slow pagination in product catalog
-- Problem: Pagination with OFFSET is slow for large product catalog
-- The following query gets slower as offset increases:
-- EXPLAIN ANALYZE SELECT * FROM products ORDER BY name LIMIT 20 OFFSET 10000;
-- Solution: Use keyset pagination instead
-- EXPLAIN ANALYZE SELECT * FROM products WHERE name > 'Last Product Name from Previous Page' ORDER BY name LIMIT 20;

-- CHALLENGE 10: Slow view performance
-- Problem: Order details view is slow
-- The following query is slow:
-- EXPLAIN ANALYZE SELECT * FROM vw_order_details WHERE order_date > '2023-01-01';
-- Solution: Create materialized view and refresh periodically
-- CREATE MATERIALIZED VIEW mv_order_details AS SELECT * FROM vw_order_details;
-- CREATE INDEX idx_mv_order_details_order_date ON mv_order_details(order_date);
-- REFRESH MATERIALIZED VIEW mv_order_details;

-- CHALLENGE 11: Partial index for active products
-- Problem: Most queries only care about active products
-- The following query is slow when there are many inactive products:
-- EXPLAIN ANALYZE SELECT * FROM products WHERE is_active = true AND category_id = 3;
-- Solution: Use partial index
-- CREATE INDEX idx_products_active_category ON products(category_id) WHERE is_active = true;

-- CHALLENGE 12: Using JSONB for flexible attributes
-- Problem: Need to store different attributes for different product types
-- Solution: Convert select fields to JSONB
-- ALTER TABLE products ADD COLUMN attributes JSONB;
-- CREATE INDEX idx_products_attributes ON products USING gin(attributes);
-- UPDATE products SET attributes = jsonb_build_object('color', 'black', 'size', 'XL') WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d482';
-- EXPLAIN ANALYZE SELECT * FROM products WHERE attributes @> '{"color": "black"}';

-- CHALLENGE 13: Replace CSV with array for better performance
-- Problem: Using array_to_string and string_to_array is slow
-- Solution: Use native arrays and array operators
-- CREATE INDEX idx_products_tags_gin ON products USING gin(tags);
-- EXPLAIN ANALYZE SELECT * FROM products WHERE tags && ARRAY['laptop', 'computer'];

-- CHALLENGE 14: Using parallel queries for large data sets
-- Problem: Large aggregation queries are slow
-- Solution: Increase max_parallel_workers and max_parallel_workers_per_gather
-- EXPLAIN (ANALYZE, VERBOSE)
-- SELECT category_id, COUNT(*), AVG(price)
-- FROM products
-- GROUP BY category_id;

-- CHALLENGE 15: Optimizing common JOIN patterns
-- Problem: Multi-table joins are slow
-- Solution: Denormalize carefully or create summary tables
-- CREATE TABLE product_sales_summary (
--   product_id UUID PRIMARY KEY REFERENCES products(id),
--   total_quantity INTEGER,
--   total_revenue DECIMAL(10, 2),
--   last_updated TIMESTAMP WITH TIME ZONE
-- );
-- CREATE INDEX idx_product_sales_summary_revenue ON product_sales_summary(total_revenue); 