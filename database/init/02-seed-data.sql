-- Set search path
SET search_path TO ecommerce, public;

-- Insert warehouse data
INSERT INTO warehouses (name, address, city, postal_code, country)
VALUES 
    ('Main Warehouse', '123 Storage Blvd', 'Warehouseville', '12345', 'United States'),
    ('East Coast Facility', '456 Shipping Lane', 'Logistics City', '67890', 'United States'),
    ('West Coast Depot', '789 Inventory Road', 'Supply Town', '13579', 'United States');

-- Insert categories (with hierarchical structure)
INSERT INTO categories (id, name, description, parent_id)
VALUES 
    (1, 'Electronics', 'Electronic devices and gadgets', NULL),
    (2, 'Computers', 'Desktop and laptop computers', 1),
    (3, 'Smartphones', 'Mobile phones and accessories', 1),
    (4, 'Audio', 'Headphones, speakers and audio equipment', 1),
    (5, 'Clothing', 'Apparel and fashion items', NULL),
    (6, 'Men''s Clothing', 'Clothing for men', 5),
    (7, 'Women''s Clothing', 'Clothing for women', 5),
    (8, 'Home & Kitchen', 'Home appliances and kitchenware', NULL),
    (9, 'Furniture', 'Home and office furniture', NULL),
    (10, 'Books', 'Books, e-books and publications', NULL);

-- Insert Users (using unhashed passwords for simplicity - in real app would be hashed)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, address, city, postal_code, country, phone)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'johndoe', 'john.doe@example.com', 'password123', 'John', 'Doe', '123 Main St', 'Anytown', '12345', 'United States', '555-123-4567'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'janedoe', 'jane.doe@example.com', 'password123', 'Jane', 'Doe', '456 Oak Ave', 'Somewhere', '67890', 'United States', '555-987-6543'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'bobsmith', 'bob.smith@example.com', 'password123', 'Bob', 'Smith', '789 Pine Rd', 'Elsewhere', '13579', 'United States', '555-456-7890'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'alicejones', 'alice.jones@example.com', 'password123', 'Alice', 'Jones', '321 Elm St', 'Nowhere', '24680', 'United States', '555-789-0123');

-- Insert products (UUID generated for readability in this example)
INSERT INTO products (id, name, description, price, stock_quantity, category_id, is_featured, sku, weight, dimensions, tags)
VALUES 
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Laptop Pro X', 'High-performance laptop with 16GB RAM and 1TB SSD', 1299.99, 50, 2, TRUE, 'LP-X-001', 2.5, '15x10x1', ARRAY['laptop', 'computer', 'high-performance']),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Smartphone Galaxy', 'Latest smartphone with 128GB storage', 899.99, 100, 3, TRUE, 'SG-001', 0.3, '6x3x0.5', ARRAY['phone', 'smartphone', 'android']),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Wireless Headphones', 'Noise-cancelling wireless headphones', 199.99, 200, 4, TRUE, 'WH-001', 0.25, '8x8x4', ARRAY['headphones', 'wireless', 'audio']),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Men''s Cotton T-Shirt', 'Comfortable 100% cotton t-shirt', 19.99, 500, 6, FALSE, 'MT-001', 0.2, NULL, ARRAY['clothing', 'men', 't-shirt']),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'Women''s Dress', 'Elegant evening dress', 89.99, 75, 7, TRUE, 'WD-001', 0.5, NULL, ARRAY['clothing', 'women', 'dress']),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d484', 'Coffee Maker', 'Programmable drip coffee maker', 49.99, 150, 8, FALSE, 'CM-001', 2.0, '10x10x15', ARRAY['appliance', 'kitchen', 'coffee']),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d485', 'Office Chair', 'Ergonomic office chair with lumbar support', 149.99, 30, 9, FALSE, 'OC-001', 15.0, '25x25x45', ARRAY['furniture', 'chair', 'office']),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d486', 'Programming Guide', 'Comprehensive guide to modern programming', 34.99, 100, 10, FALSE, 'BK-001', 1.0, '9x6x1.5', ARRAY['book', 'programming', 'educational']),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d487', 'Tablet Pro', 'Lightweight tablet with 10-inch screen', 399.99, 80, 1, TRUE, 'TB-001', 0.5, '10x7x0.3', ARRAY['tablet', 'electronics']),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d488', 'Bluetooth Speaker', 'Portable Bluetooth speaker with 10-hour battery', 79.99, 120, 4, FALSE, 'BS-001', 0.75, '6x6x8', ARRAY['speaker', 'bluetooth', 'audio']);

-- Insert product images
INSERT INTO product_images (product_id, image_url, is_primary)
VALUES 
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'https://example.com/images/laptop_pro_x_1.jpg', TRUE),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'https://example.com/images/laptop_pro_x_2.jpg', FALSE),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'https://example.com/images/smartphone_galaxy_1.jpg', TRUE),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'https://example.com/images/wireless_headphones_1.jpg', TRUE),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'https://example.com/images/mens_tshirt_1.jpg', TRUE),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'https://example.com/images/womens_dress_1.jpg', TRUE),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d484', 'https://example.com/images/coffee_maker_1.jpg', TRUE),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d485', 'https://example.com/images/office_chair_1.jpg', TRUE),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d486', 'https://example.com/images/programming_guide_1.jpg', TRUE),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d487', 'https://example.com/images/tablet_pro_1.jpg', TRUE),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d488', 'https://example.com/images/bluetooth_speaker_1.jpg', TRUE);

-- Insert product inventory
INSERT INTO product_inventory (product_id, warehouse_id, quantity)
VALUES 
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 1, 30),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 2, 20),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 1, 50),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 2, 50),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 1, 100),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 3, 100),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d482', 1, 200),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d482', 2, 150),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d482', 3, 150),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 2, 75),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d484', 1, 75),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d484', 3, 75),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d485', 1, 15),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d485', 3, 15),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d486', 2, 50),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d486', 3, 50),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d487', 1, 40),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d487', 2, 40),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d488', 1, 60),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d488', 3, 60);

-- Insert shopping carts
INSERT INTO shopping_cart (user_id, session_id)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', NULL),
    (NULL, 'session123456789'),
    (NULL, 'session987654321');

-- Insert cart items
INSERT INTO cart_items (cart_id, product_id, quantity)
VALUES 
    (1, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 1),
    (1, 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 2),
    (2, 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 1),
    (3, 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 1),
    (3, 'f47ac10b-58cc-4372-a567-0e02b2c3d486', 1),
    (4, 'f47ac10b-58cc-4372-a567-0e02b2c3d485', 1);

-- Insert orders
INSERT INTO orders (id, user_id, status, total_amount, shipping_address, shipping_city, shipping_postal_code, shipping_country, payment_method, payment_status)
VALUES 
    ('e47ac10b-58cc-4372-a567-0e02b2c3d479', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'completed', 1499.97, '123 Main St', 'Anytown', '12345', 'United States', 'credit_card', 'paid'),
    ('e47ac10b-58cc-4372-a567-0e02b2c3d480', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'processing', 899.99, '456 Oak Ave', 'Somewhere', '67890', 'United States', 'paypal', 'paid'),
    ('e47ac10b-58cc-4372-a567-0e02b2c3d481', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'pending', 149.99, '789 Pine Rd', 'Elsewhere', '13579', 'United States', 'credit_card', 'pending'),
    ('e47ac10b-58cc-4372-a567-0e02b2c3d482', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'completed', 134.98, '321 Elm St', 'Nowhere', '24680', 'United States', 'credit_card', 'paid');

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES 
    ('e47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 1, 1299.99),
    ('e47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 1, 199.98),
    ('e47ac10b-58cc-4372-a567-0e02b2c3d480', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 1, 899.99),
    ('e47ac10b-58cc-4372-a567-0e02b2c3d481', 'f47ac10b-58cc-4372-a567-0e02b2c3d485', 1, 149.99),
    ('e47ac10b-58cc-4372-a567-0e02b2c3d482', 'f47ac10b-58cc-4372-a567-0e02b2c3d486', 1, 34.99),
    ('e47ac10b-58cc-4372-a567-0e02b2c3d482', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 2, 49.99);

-- Insert product reviews
INSERT INTO product_reviews (product_id, user_id, rating, review_text)
VALUES 
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, 'Excellent laptop! Fast performance and great battery life.'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 4, 'Very good laptop. A bit heavy but performance is excellent.'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 5, 'Best smartphone I have ever used!'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3, 'Decent headphones but noise cancellation could be better.'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d484', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 4, 'Makes great coffee. Easy to use.'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d485', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 5, 'Very comfortable chair. My back pain is gone!'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d486', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 5, 'Excellent programming guide. Well written and comprehensive.');

-- Insert payments
INSERT INTO payments (id, order_id, payment_method, amount, status, transaction_id)
VALUES 
    ('p47ac10b-58cc-4372-a567-0e02b2c3d479', 'e47ac10b-58cc-4372-a567-0e02b2c3d479', 'credit_card', 1499.97, 'completed', 'tx_123456789'),
    ('p47ac10b-58cc-4372-a567-0e02b2c3d480', 'e47ac10b-58cc-4372-a567-0e02b2c3d480', 'paypal', 899.99, 'completed', 'tx_234567890'),
    ('p47ac10b-58cc-4372-a567-0e02b2c3d481', 'e47ac10b-58cc-4372-a567-0e02b2c3d482', 'credit_card', 134.98, 'completed', 'tx_345678901');

-- Create function to generate a large number of products for performance testing
CREATE OR REPLACE FUNCTION generate_test_products(num_products INTEGER) RETURNS VOID AS $$
DECLARE
    i INTEGER;
    product_id UUID;
    category_id INTEGER;
    product_name TEXT;
    product_price DECIMAL(10, 2);
BEGIN
    FOR i IN 1..num_products LOOP
        product_id := uuid_generate_v4();
        category_id := floor(random() * 10 + 1)::INTEGER;
        product_name := 'Test Product ' || i;
        product_price := (random() * 1000 + 10)::DECIMAL(10, 2);
        
        INSERT INTO products (
            id, name, description, price, stock_quantity, category_id,
            is_featured, is_active, sku, weight
        ) VALUES (
            product_id,
            product_name,
            'This is a test product generated for performance testing.',
            product_price,
            floor(random() * 1000)::INTEGER,
            category_id,
            FALSE,
            TRUE,
            'TEST-' || i,
            (random() * 10)::DECIMAL(8, 2)
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate 10,000 test products for performance testing
SELECT generate_test_products(10000);

-- Create a large dataset to demonstrate performance issues due to missing indexes

-- Insert users (1000 users)
DO $$
DECLARE
    i INTEGER;
    user_id UUID;
    user_username TEXT;
    user_email TEXT;
BEGIN
    FOR i IN 1..1000 LOOP
        user_id := gen_random_uuid();
        user_username := 'user_' || i;
        user_email := 'user_' || i || '@example.com';
        
        INSERT INTO ecommerce.users (
            id, username, email, password_hash, address
        ) VALUES (
            user_id,
            user_username,
            user_email,
            'password_hash_' || i,
            i || ' Main St, City ' || (i % 100) || ', Country ' || (i % 10)
        );
    END LOOP;
END $$;

-- Insert categories (20 categories)
DO $$
DECLARE
    i INTEGER;
    category_id UUID;
    category_name TEXT;
    parent_id UUID := NULL;
BEGIN
    -- Main categories
    FOR i IN 1..10 LOOP
        category_id := gen_random_uuid();
        category_name := CASE
            WHEN i = 1 THEN 'Electronics'
            WHEN i = 2 THEN 'Fashion'
            WHEN i = 3 THEN 'Home & Kitchen'
            WHEN i = 4 THEN 'Books'
            WHEN i = 5 THEN 'Beauty'
            WHEN i = 6 THEN 'Sports'
            WHEN i = 7 THEN 'Toys'
            WHEN i = 8 THEN 'Automotive'
            WHEN i = 9 THEN 'Health'
            WHEN i = 10 THEN 'Food'
            ELSE 'Category ' || i
        END;
        
        INSERT INTO ecommerce.categories (
            id, name, description
        ) VALUES (
            category_id,
            category_name,
            'Description for ' || category_name
        );
    END LOOP;
    
    -- Subcategories
    FOR i IN 11..20 LOOP
        category_id := gen_random_uuid();
        
        -- Select a random parent category
        SELECT id INTO parent_id FROM ecommerce.categories WHERE id IN (
            SELECT id FROM ecommerce.categories LIMIT 10
        ) ORDER BY random() LIMIT 1;
        
        category_name := CASE
            WHEN i = 11 THEN 'Smartphones'
            WHEN i = 12 THEN 'Laptops'
            WHEN i = 13 THEN 'Men''s Clothing'
            WHEN i = 14 THEN 'Women''s Clothing'
            WHEN i = 15 THEN 'Furniture'
            WHEN i = 16 THEN 'Kitchen Appliances'
            WHEN i = 17 THEN 'Fiction'
            WHEN i = 18 THEN 'Non-Fiction'
            WHEN i = 19 THEN 'Skincare'
            WHEN i = 20 THEN 'Makeup'
            ELSE 'Subcategory ' || i
        END;
        
        INSERT INTO ecommerce.categories (
            id, name, description, parent_category_id
        ) VALUES (
            category_id,
            category_name,
            'Description for ' || category_name,
            parent_id
        );
    END LOOP;
END $$;

-- Insert products (5000 products)
DO $$
DECLARE
    i INTEGER;
    product_id UUID;
    product_name TEXT;
    product_description TEXT;
    product_price DECIMAL(10, 2);
    category_id UUID;
BEGIN
    FOR i IN 1..5000 LOOP
        product_id := gen_random_uuid();
        product_name := 'Product ' || i;
        product_description := 'Description for product ' || i || '. This is a sample product with various features and specifications.';
        product_price := (random() * 1000)::DECIMAL(10, 2);
        
        -- Select a random category
        SELECT id INTO category_id FROM ecommerce.categories ORDER BY random() LIMIT 1;
        
        INSERT INTO ecommerce.products (
            id, name, description, price, image_url, category_id
        ) VALUES (
            product_id,
            product_name,
            product_description,
            product_price,
            'https://picsum.photos/id/' || (i % 1000) || '/400/400',
            category_id
        );
    END LOOP;
END $$;

-- Insert shopping carts (500 carts)
DO $$
DECLARE
    i INTEGER;
    cart_id UUID;
    user_id UUID;
BEGIN
    FOR i IN 1..500 LOOP
        cart_id := gen_random_uuid();
        
        -- Select a random user
        SELECT id INTO user_id FROM ecommerce.users ORDER BY random() LIMIT 1;
        
        INSERT INTO ecommerce.shopping_cart (
            id, user_id
        ) VALUES (
            cart_id,
            user_id
        );
    END LOOP;
END $$;

-- Insert cart items (2000 items)
DO $$
DECLARE
    i INTEGER;
    cart_id UUID;
    product_id UUID;
    quantity INTEGER;
BEGIN
    FOR i IN 1..2000 LOOP
        -- Select a random cart
        SELECT id INTO cart_id FROM ecommerce.shopping_cart ORDER BY random() LIMIT 1;
        
        -- Select a random product
        SELECT id INTO product_id FROM ecommerce.products ORDER BY random() LIMIT 1;
        
        quantity := (random() * 5 + 1)::INTEGER;
        
        -- Insert or update cart item
        BEGIN
            INSERT INTO ecommerce.cart_items (
                id, cart_id, product_id, quantity
            ) VALUES (
                gen_random_uuid(),
                cart_id,
                product_id,
                quantity
            );
        EXCEPTION WHEN unique_violation THEN
            -- If the cart already has this product, update the quantity
            UPDATE ecommerce.cart_items 
            SET quantity = quantity + 1
            WHERE cart_id = cart_id AND product_id = product_id;
        END;
    END LOOP;
END $$;

-- Insert orders (3000 orders with various statuses)
DO $$
DECLARE
    i INTEGER;
    order_id UUID;
    user_id UUID;
    order_status TEXT;
    order_total DECIMAL(10, 2);
    order_date TIMESTAMP;
BEGIN
    FOR i IN 1..3000 LOOP
        order_id := gen_random_uuid();
        
        -- Select a random user
        SELECT id INTO user_id FROM ecommerce.users ORDER BY random() LIMIT 1;
        
        -- Generate a random status
        order_status := CASE (i % 5)
            WHEN 0 THEN 'pending'
            WHEN 1 THEN 'processing'
            WHEN 2 THEN 'shipped'
            WHEN 3 THEN 'delivered'
            WHEN 4 THEN 'cancelled'
        END;
        
        order_total := (random() * 1000 + 10)::DECIMAL(10, 2);
        
        -- Generate a random date within the last year
        order_date := NOW() - (random() * 365 * interval '1 day');
        
        INSERT INTO ecommerce.orders (
            id, user_id, total_amount, status, shipping_address, created_at
        ) VALUES (
            order_id,
            user_id,
            order_total,
            order_status,
            (random() * 1000)::INTEGER || ' Main St, City ' || (i % 100) || ', Country ' || (i % 10),
            order_date
        );
    END LOOP;
END $$;

-- Insert order items (10000 items)
DO $$
DECLARE
    i INTEGER;
    order_id UUID;
    product_id UUID;
    quantity INTEGER;
    unit_price DECIMAL(10, 2);
BEGIN
    FOR i IN 1..10000 LOOP
        -- Select a random order
        SELECT id INTO order_id FROM ecommerce.orders ORDER BY random() LIMIT 1;
        
        -- Select a random product
        SELECT id, price INTO product_id, unit_price FROM ecommerce.products ORDER BY random() LIMIT 1;
        
        quantity := (random() * 5 + 1)::INTEGER;
        
        INSERT INTO ecommerce.order_items (
            id, order_id, product_id, quantity, unit_price
        ) VALUES (
            gen_random_uuid(),
            order_id,
            product_id,
            quantity,
            unit_price
        );
    END LOOP;
END $$;

-- Create a special UUID for demo purposes that's easy to remember
DO $$
DECLARE
    demo_user_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    demo_cart_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
    product_id UUID;
BEGIN
    -- Insert or update the demo user
    INSERT INTO ecommerce.users (
        id, username, email, password_hash, address
    ) VALUES (
        demo_user_id,
        'demo_user',
        'demo@example.com',
        'demo_password_hash',
        '123 Demo Street, Demo City, Demo Country'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Insert or update the demo cart
    INSERT INTO ecommerce.shopping_cart (
        id, user_id
    ) VALUES (
        demo_cart_id,
        demo_user_id
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Add some items to the demo cart
    FOR i IN 1..5 LOOP
        -- Select a random product
        SELECT id INTO product_id FROM ecommerce.products ORDER BY random() LIMIT 1;
        
        -- Insert or update cart item
        BEGIN
            INSERT INTO ecommerce.cart_items (
                id, cart_id, product_id, quantity
            ) VALUES (
                gen_random_uuid(),
                demo_cart_id,
                product_id,
                i
            );
        EXCEPTION WHEN unique_violation THEN
            -- If the cart already has this product, update the quantity
            UPDATE ecommerce.cart_items 
            SET quantity = i
            WHERE cart_id = demo_cart_id AND product_id = product_id;
        END;
    END LOOP;
    
    -- Create some orders for the demo user with different statuses
    FOR i IN 1..10 LOOP
        INSERT INTO ecommerce.orders (
            id, user_id, total_amount, status, shipping_address, created_at
        ) VALUES (
            gen_random_uuid(),
            demo_user_id,
            (random() * 500 + 50)::DECIMAL(10, 2),
            CASE (i % 5)
                WHEN 0 THEN 'pending'
                WHEN 1 THEN 'processing'
                WHEN 2 THEN 'shipped'
                WHEN 3 THEN 'delivered'
                WHEN 4 THEN 'cancelled'
            END,
            '123 Demo Street, Demo City, Demo Country',
            NOW() - (i * 7 * interval '1 day')
        );
    END LOOP;
END $$; 