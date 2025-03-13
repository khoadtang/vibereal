-- Performance Challenge Queries
-- These queries are designed to highlight database performance issues

-- Set search path
SET search_path TO ecommerce, public;

-- Create a special table to store challenge information
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    initial_query TEXT,
    hint TEXT,
    solution_explanation TEXT,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5)
);

-- Insert challenge data
INSERT INTO challenges (name, description, initial_query, hint, solution_explanation, difficulty)
VALUES
(
    'Slow Product Search',
    'The product search is running very slowly. Users are complaining about the time it takes to search for products by name.',
    'EXPLAIN ANALYZE SELECT * FROM products WHERE name ILIKE ''%Product 5%'';',
    'Consider using a more efficient text search method or a proper index. The ILIKE operator with wildcards at the beginning cannot use standard B-tree indexes.',
    'Create a trigram index using GIN: CREATE INDEX idx_products_name_trigram ON products USING gin (name gin_trgm_ops);',
    2
),
(
    'User Lookup Performance',
    'Looking up users by email is a common operation and is currently very slow.',
    'EXPLAIN ANALYZE SELECT * FROM users WHERE email = ''user100@example.com'';',
    'The email field is frequently used for lookups but has no index. This causes a sequential scan of the entire users table.',
    'Create an index on the email field: CREATE INDEX idx_users_email ON users(email);',
    1
),
(
    'Inefficient Joins',
    'Joining product and inventory data is taking too long, affecting the product listing pages.',
    'EXPLAIN ANALYZE SELECT p.id, p.name, p.price, i.quantity 
     FROM products p 
     JOIN inventory i ON p.id = i.product_id 
     WHERE p.category_id = 9;',
    'The join between products and inventory is inefficient due to missing indexes and foreign key constraints.',
    'Add an index on inventory.product_id and establish a proper foreign key: CREATE INDEX idx_inventory_product_id ON inventory(product_id); ALTER TABLE inventory ADD CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id);',
    3
),
(
    'Slow Order Processing',
    'Order processing is very slow due to inefficient queries.',
    'EXPLAIN ANALYZE SELECT o.id, o.created_at, o.status, o.total_amount, u.email, COUNT(oi.id) as item_count 
     FROM orders o 
     JOIN users u ON o.user_id = u.id 
     JOIN order_items oi ON o.id = oi.order_id 
     WHERE o.status = ''processing'' 
     GROUP BY o.id, u.email;',
    'This query is performing inefficient joins and has missing indexes on frequently filtered columns.',
    'Add indexes for status and joins: CREATE INDEX idx_orders_status ON orders(status); CREATE INDEX idx_orders_user_id ON orders(user_id); CREATE INDEX idx_order_items_order_id ON order_items(order_id);',
    4
),
(
    'Cart Performance Issues',
    'Retrieving cart information for users is too slow.',
    'EXPLAIN ANALYZE SELECT u.username, p.name, ci.quantity, p.price 
     FROM cart_items ci 
     JOIN users u ON ci.user_id = u.id 
     JOIN products p ON ci.product_id = p.id 
     WHERE ci.user_id = 100;',
    'The cart items table is missing indexes on foreign keys, and the relationship with products lacks a proper constraint.',
    'Add indexes and constraints: CREATE INDEX idx_cart_items_user_id ON cart_items(user_id); CREATE INDEX idx_cart_items_product_id ON cart_items(product_id); ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id);',
    2
),
(
    'Inefficient Product Review Queries',
    'Retrieving product reviews is excessively slow and resource-intensive.',
    'EXPLAIN ANALYZE SELECT p.name, AVG(pr.rating) as avg_rating, COUNT(pr.id) as review_count 
     FROM products p 
     LEFT JOIN product_reviews pr ON p.id = pr.product_id 
     GROUP BY p.name 
     ORDER BY avg_rating DESC;',
    'The product_reviews table has no index on product_id, causing inefficient joins. Also, the denormalized user_name creates update anomalies.',
    'Add an index on product_id and consider normalizing the schema: CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);',
    3
),
(
    'Slow Product Category Listing',
    'Listing products by category is slow, affecting category browsing pages.',
    'EXPLAIN ANALYZE SELECT p.* 
     FROM products p 
     WHERE p.category_id = 12 
     ORDER BY p.name;',
    'The products table has no index on category_id, which is frequently used for filtering.',
    'Create an index on the category_id field: CREATE INDEX idx_products_category_id ON products(category_id);',
    2
),
(
    'Denormalization Issues',
    'The orders table duplicates user information, causing update anomalies and inefficiencies.',
    'EXPLAIN ANALYZE SELECT o.* 
     FROM orders o 
     WHERE o.user_city = ''City42'';',
    'The denormalized design with repeated user information in orders table causes data duplication and consistency issues.',
    'Normalize the schema by removing redundant fields and relying on proper joins: ALTER TABLE orders DROP COLUMN user_email, DROP COLUMN user_address, DROP COLUMN user_city, DROP COLUMN user_postal_code, DROP COLUMN user_country;',
    4
),
(
    'Missing Foreign Keys',
    'Many tables lack proper foreign key constraints, affecting data integrity and potentially causing performance issues.',
    'SELECT table_name, column_name 
     FROM information_schema.columns 
     WHERE column_name LIKE ''%_id'' 
     AND table_name IN (''products'', ''inventory'', ''cart_items'', ''order_items'', ''product_reviews'');',
    'Several tables with _id columns are missing foreign key constraints, which can affect both performance and data integrity.',
    'Add appropriate foreign key constraints to maintain referential integrity: ALTER TABLE products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id);',
    3
),
(
    'Inefficient Sorting and Pagination',
    'Product listing with sorting and pagination is extremely slow.',
    'EXPLAIN ANALYZE SELECT * FROM products ORDER BY price DESC LIMIT 20 OFFSET 60;',
    'When sorting and using LIMIT/OFFSET for pagination, the database must sort the entire result set first.',
    'Create an index that supports the sort operation: CREATE INDEX idx_products_price ON products(price DESC);',
    3
);

-- Create views for each challenge to make them easier to access
CREATE VIEW challenge_1 AS 
SELECT * FROM products WHERE name ILIKE '%Product 5%';

CREATE VIEW challenge_2 AS 
SELECT * FROM users WHERE email = 'user100@example.com';

CREATE VIEW challenge_3 AS 
SELECT p.id, p.name, p.price, i.quantity 
FROM products p 
JOIN inventory i ON p.id = i.product_id 
WHERE p.category_id = 9;

CREATE VIEW challenge_4 AS 
SELECT o.id, o.created_at, o.status, o.total_amount, u.email, COUNT(oi.id) as item_count 
FROM orders o 
JOIN users u ON o.user_id = u.id 
JOIN order_items oi ON o.id = oi.order_id 
WHERE o.status = 'processing' 
GROUP BY o.id, u.email;

CREATE VIEW challenge_5 AS 
SELECT u.username, p.name, ci.quantity, p.price 
FROM cart_items ci 
JOIN users u ON ci.user_id = u.id 
JOIN products p ON ci.product_id = p.id 
WHERE ci.user_id = 100;

CREATE VIEW challenge_6 AS 
SELECT p.name, AVG(pr.rating) as avg_rating, COUNT(pr.id) as review_count 
FROM products p 
LEFT JOIN product_reviews pr ON p.id = pr.product_id 
GROUP BY p.name 
ORDER BY avg_rating DESC;

CREATE VIEW challenge_7 AS 
SELECT p.* 
FROM products p 
WHERE p.category_id = 12 
ORDER BY p.name;

CREATE VIEW challenge_8 AS 
SELECT o.* 
FROM orders o 
WHERE o.user_city = 'City42';

CREATE VIEW challenge_9 AS 
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE column_name LIKE '%_id' 
AND table_name IN ('products', 'inventory', 'cart_items', 'order_items', 'product_reviews');

CREATE VIEW challenge_10 AS 
SELECT * FROM products ORDER BY price DESC LIMIT 20 OFFSET 60;

-- Create a function to run EXPLAIN ANALYZE on a view
CREATE OR REPLACE FUNCTION explain_view(view_name text) 
RETURNS TABLE(query_plan text) 
LANGUAGE plpgsql AS $$
DECLARE
    view_definition text;
BEGIN
    -- Get the view definition
    SELECT pg_get_viewdef(view_name::regclass) INTO view_definition;
    
    -- Run EXPLAIN ANALYZE on the view definition
    RETURN QUERY EXECUTE 'EXPLAIN ANALYZE ' || view_definition;
END;
$$;

-- Create a helper function to check if a solution has been applied
CREATE OR REPLACE FUNCTION check_index_exists(index_name text) 
RETURNS boolean 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = index_name
    );
END;
$$;

-- Create a helper function to check if a foreign key constraint exists
CREATE OR REPLACE FUNCTION check_constraint_exists(constraint_name text) 
RETURNS boolean 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = constraint_name 
        AND constraint_type = 'FOREIGN KEY'
    );
END;
$$; 