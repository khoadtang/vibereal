-- Set search path
SET search_path TO ecommerce, public;

-- Add more seed data to better illustrate performance issues from missing indexes

-- Generate more users (additional 5000 users)
DO $$
DECLARE
    i INTEGER;
    user_id UUID;
    user_username TEXT;
    user_email TEXT;
BEGIN
    FOR i IN 1001..6000 LOOP
        user_id := gen_random_uuid();
        user_username := 'user_' || i;
        user_email := 'user_' || i || '@example.com';
        
        INSERT INTO users (
            id, username, email, password_hash
        ) VALUES (
            user_id,
            user_username,
            user_email,
            'password_hash_' || i
        );
    END LOOP;
END $$;

-- Generate more products (additional 15000 products)
DO $$
DECLARE
    i INTEGER;
    product_id UUID;
    product_name TEXT;
    product_description TEXT;
    product_price DECIMAL(10, 2);
    category_id INTEGER;
BEGIN
    FOR i IN 5001..20000 LOOP
        product_id := gen_random_uuid();
        product_name := 'Product ' || i;
        product_description := 'Description for product ' || i || '. This is a sample product with various features and specifications.';
        product_price := (random() * 1000)::DECIMAL(10, 2);
        
        -- Select a random category (1-10)
        category_id := floor(random() * 10 + 1)::INTEGER;
        
        INSERT INTO products (
            id, name, description, price, stock_quantity, category_id,
            is_featured, is_active, sku, weight
        ) VALUES (
            product_id,
            product_name,
            product_description,
            product_price,
            floor(random() * 1000)::INTEGER,
            category_id,
            (random() > 0.9), -- 10% chance of being featured
            TRUE,
            'SKU-' || i,
            (random() * 10)::DECIMAL(8, 2)
        );
    END LOOP;
END $$;

-- Generate more orders (additional 7000 orders)
DO $$
DECLARE
    i INTEGER;
    order_id UUID;
    user_id UUID;
    order_status TEXT;
    order_total DECIMAL(10, 2);
    order_date TIMESTAMP;
BEGIN
    FOR i IN 3001..10000 LOOP
        order_id := gen_random_uuid();
        
        -- Select a random user
        SELECT id INTO user_id FROM users ORDER BY random() LIMIT 1;
        
        -- Generate a random status
        order_status := CASE (i % 5)
            WHEN 0 THEN 'pending'
            WHEN 1 THEN 'processing'
            WHEN 2 THEN 'completed'
            WHEN 3 THEN 'shipped'
            WHEN 4 THEN 'cancelled'
        END;
        
        order_total := (random() * 1000 + 10)::DECIMAL(10, 2);
        
        -- Generate a random date within the last 2 years
        order_date := NOW() - (random() * 730 * interval '1 day');
        
        INSERT INTO orders (
            id, user_id, status, total_amount, created_at
        ) VALUES (
            order_id,
            user_id,
            order_status,
            order_total,
            order_date
        );
    END LOOP;
END $$;

-- Generate more order items (additional 30000 items)
DO $$
DECLARE
    i INTEGER;
    order_id UUID;
    product_id UUID;
    quantity INTEGER;
    unit_price DECIMAL(10, 2);
BEGIN
    FOR i IN 10001..40000 LOOP
        -- Select a random order
        SELECT id INTO order_id FROM orders ORDER BY random() LIMIT 1;
        
        -- Select a random product
        SELECT id, price INTO product_id, unit_price FROM products ORDER BY random() LIMIT 1;
        
        quantity := (random() * 5 + 1)::INTEGER;
        
        INSERT INTO order_items (
            order_id, product_id, quantity, unit_price
        ) VALUES (
            order_id,
            product_id,
            quantity,
            unit_price
        );
    END LOOP;
END $$;

-- Generate more product reviews (20000 reviews)
DO $$
DECLARE
    i INTEGER;
    product_id UUID;
    user_id UUID;
    rating INTEGER;
    review_text TEXT;
    review_date TIMESTAMP;
BEGIN
    FOR i IN 1..20000 LOOP
        -- Select a random product
        SELECT id INTO product_id FROM products ORDER BY random() LIMIT 1;
        
        -- Select a random user
        SELECT id INTO user_id FROM users ORDER BY random() LIMIT 1;
        
        -- Generate a random rating (1-5)
        rating := floor(random() * 5 + 1)::INTEGER;
        
        -- Generate review text
        review_text := CASE rating
            WHEN 1 THEN 'Very disappointed with this product. ' || 'Issue ' || (i % 10) || ': ' || 'The quality is poor.'
            WHEN 2 THEN 'Below average product. ' || 'Issue ' || (i % 10) || ': ' || 'Not worth the price.'
            WHEN 3 THEN 'Average product. ' || 'Pro ' || (i % 5) || ': ' || 'Works as expected. ' || 'Con ' || (i % 5) || ': ' || 'Nothing special.'
            WHEN 4 THEN 'Good product. ' || 'Pro ' || (i % 5) || ': ' || 'Good quality and value.'
            WHEN 5 THEN 'Excellent product! ' || 'Pro ' || (i % 5) || ': ' || 'Exceeded my expectations!'
        END;
        
        -- Generate a random date within the last year
        review_date := NOW() - (random() * 365 * interval '1 day');
        
        -- Insert the review
        INSERT INTO product_reviews (
            product_id, user_id, rating, review_text, created_at
        ) VALUES (
            product_id,
            user_id,
            rating,
            review_text,
            review_date
        );
    END LOOP;
END $$;

-- Create more shopping carts (additional 1500 carts)
DO $$
DECLARE
    i INTEGER;
    cart_id UUID;
    user_id UUID;
BEGIN
    FOR i IN 501..2000 LOOP
        cart_id := gen_random_uuid();
        
        -- Select a random user
        SELECT id INTO user_id FROM users ORDER BY random() LIMIT 1;
        
        INSERT INTO shopping_cart (
            user_id
        ) VALUES (
            user_id
        );
    END LOOP;
END $$;

-- Add more cart items (additional 8000 items)
DO $$
DECLARE
    i INTEGER;
    cart_id UUID;
    product_id UUID;
    quantity INTEGER;
BEGIN
    FOR i IN 2001..10000 LOOP
        -- Select a random cart
        SELECT id INTO cart_id FROM shopping_cart ORDER BY random() LIMIT 1;
        
        -- Select a random product
        SELECT id INTO product_id FROM products ORDER BY random() LIMIT 1;
        
        quantity := (random() * 5 + 1)::INTEGER;
        
        -- Insert cart item
        BEGIN
            INSERT INTO cart_items (
                cart_id, product_id, quantity
            ) VALUES (
                cart_id,
                product_id,
                quantity
            );
        EXCEPTION WHEN unique_violation THEN
            -- If the cart already has this product, update the quantity
            UPDATE cart_items 
            SET quantity = quantity + 1
            WHERE cart_id = cart_id AND product_id = product_id;
        END;
    END LOOP;
END $$;

-- Add a comment to explain the purpose of this file
COMMENT ON DATABASE postgres IS 'This additional seed data is designed to illustrate performance issues that can occur with missing indexes on large datasets.'; 