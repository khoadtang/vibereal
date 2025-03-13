-- Set search path
SET search_path TO ecommerce, public;

-- First, clean up the generic products
DELETE FROM ecommerce.product_reviews
WHERE product_id IN (
    SELECT id FROM ecommerce.products
    WHERE name LIKE 'Product %' OR name LIKE 'Test Product %'
);

DELETE FROM ecommerce.order_items
WHERE product_id IN (
    SELECT id FROM ecommerce.products
    WHERE name LIKE 'Product %' OR name LIKE 'Test Product %'
);

DELETE FROM ecommerce.cart_items
WHERE product_id IN (
    SELECT id FROM ecommerce.products
    WHERE name LIKE 'Product %' OR name LIKE 'Test Product %'
);

DELETE FROM ecommerce.product_inventory
WHERE product_id IN (
    SELECT id FROM ecommerce.products
    WHERE name LIKE 'Product %' OR name LIKE 'Test Product %'
);

DELETE FROM ecommerce.product_images
WHERE product_id IN (
    SELECT id FROM ecommerce.products
    WHERE name LIKE 'Product %' OR name LIKE 'Test Product %'
);

-- Delete the generic products
DELETE FROM ecommerce.products
WHERE name LIKE 'Product %' OR name LIKE 'Test Product %';

-- Now add some high-quality product data

-- Electronics category products
INSERT INTO ecommerce.products (
    id, name, description, price, stock_quantity, category_id,
    is_featured, is_active, sku, weight, dimensions, tags
) VALUES 
(
    gen_random_uuid(),
    'Ultra HD Smart TV - 55"',
    'Experience stunning 4K resolution and immersive sound with this 55-inch smart TV. Features built-in streaming apps, voice control compatibility, and multiple HDMI ports for all your devices. The sleek design with minimal bezels complements any living space.',
    699.99,
    25,
    1, -- Electronics
    TRUE,
    TRUE,
    'TV-55-4K',
    15.8,
    '48.5 x 28.2 x 3.6',
    ARRAY['tv', '4k', 'smart tv', 'entertainment']
),
(
    gen_random_uuid(),
    'Professional Drone with 4K Camera',
    'Capture breathtaking aerial footage with this professional-grade drone featuring a stabilized 4K camera. With 30 minutes of flight time, obstacle avoidance technology, and intelligent flight modes, it''s perfect for both beginners and experienced pilots. The compact folding design makes it easy to transport.',
    1299.99,
    18,
    1, -- Electronics
    TRUE,
    TRUE,
    'DRONE-4K-PRO',
    1.2,
    '14 x 9.5 x 5',
    ARRAY['drone', 'camera', 'aerial', 'photography']
),
(
    gen_random_uuid(),
    'Smart Home Security System',
    'Keep your home secure with this comprehensive smart security system. Includes a base station, 4 door/window sensors, 2 motion detectors, and an HD indoor camera. Monitor and control your system from anywhere using the smartphone app. Compatible with popular voice assistants for hands-free control.',
    349.99,
    32,
    1, -- Electronics
    FALSE,
    TRUE,
    'SEC-SYS-01',
    3.5,
    '12 x 10 x 8',
    ARRAY['security', 'smart home', 'camera', 'sensors']
);

-- Clothing category products
INSERT INTO ecommerce.products (
    id, name, description, price, stock_quantity, category_id,
    is_featured, is_active, sku, weight, dimensions, tags
) VALUES 
(
    gen_random_uuid(),
    'Premium Leather Jacket',
    'This authentic leather jacket combines classic style with modern touches. Made from premium full-grain leather with a satin lining, it features multiple pockets and adjustable waist straps. The timeless design ensures you''ll enjoy this versatile piece for years to come.',
    299.99,
    15,
    6, -- Men's Clothing
    TRUE,
    TRUE,
    'MJ-LEATHER-01',
    1.8,
    NULL,
    ARRAY['jacket', 'leather', 'outerwear', 'fashion']
),
(
    gen_random_uuid(),
    'Cashmere Blend Sweater',
    'Luxuriously soft and warm, this cashmere blend sweater is perfect for cool weather. The classic fit and ribbed trim provide a flattering silhouette, while the premium fabric blend ensures durability while maintaining cashmere''s signature softness. Available in multiple sophisticated colors.',
    129.99,
    28,
    7, -- Women's Clothing
    FALSE,
    TRUE,
    'WS-CASH-03',
    0.5,
    NULL,
    ARRAY['sweater', 'cashmere', 'winter', 'luxury']
);

-- Home & Kitchen products
INSERT INTO ecommerce.products (
    id, name, description, price, stock_quantity, category_id,
    is_featured, is_active, sku, weight, dimensions, tags
) VALUES 
(
    gen_random_uuid(),
    'Professional Chef Knife Set',
    'Elevate your cooking with this 8-piece professional chef knife set. Crafted from high-carbon stainless steel with ergonomic handles, these precision-balanced knives make food preparation a pleasure. The set includes a chef knife, santoku, utility knife, paring knife, kitchen shears, and a wooden storage block.',
    179.99,
    22,
    8, -- Home & Kitchen
    TRUE,
    TRUE,
    'CHEF-SET-PRO',
    3.2,
    '16 x 6 x 12',
    ARRAY['kitchen', 'knives', 'cooking', 'chef', 'cutlery']
),
(
    gen_random_uuid(),
    'Smart Programmable Slow Cooker',
    'Make meal preparation effortless with this programmable slow cooker. Features include digital timer, multiple cooking modes, and a keep-warm function. The removable ceramic pot and tempered glass lid are dishwasher safe for easy cleanup. Control and monitor cooking progress from your smartphone.',
    89.99,
    40,
    8, -- Home & Kitchen
    FALSE,
    TRUE,
    'SLOW-COOK-SMART',
    5.4,
    '14 x 10 x 16',
    ARRAY['kitchen', 'appliance', 'slow cooker', 'cooking']
);

-- Furniture products
INSERT INTO ecommerce.products (
    id, name, description, price, stock_quantity, category_id,
    is_featured, is_active, sku, weight, dimensions, tags
) VALUES 
(
    gen_random_uuid(),
    'Ergonomic Executive Office Chair',
    'Work in comfort with this premium ergonomic office chair. Features include adjustable lumbar support, breathable mesh back, padded armrests, and multiple position recline. The reinforced base and smooth-rolling casters ensure stability and mobility. Perfect for your home office or workspace.',
    349.99,
    12,
    9, -- Furniture
    TRUE,
    TRUE,
    'CHAIR-EXEC-ERG',
    22.5,
    '28 x 26 x 48',
    ARRAY['furniture', 'chair', 'office', 'ergonomic']
),
(
    gen_random_uuid(),
    'Solid Wood Dining Table Set',
    'Bring warmth and style to your dining space with this solid wood table and chair set. The table is crafted from sustainable hardwood with a rich finish that highlights the natural grain. Includes four matching chairs with comfortable upholstered seats. Built to last for generations.',
    899.99,
    8,
    9, -- Furniture
    FALSE,
    TRUE,
    'DIN-SET-WOOD',
    85.0,
    '60 x 36 x 30',
    ARRAY['furniture', 'dining', 'table', 'chairs', 'wood']
);

-- Books products
INSERT INTO ecommerce.products (
    id, name, description, price, stock_quantity, category_id,
    is_featured, is_active, sku, weight, dimensions, tags
) VALUES 
(
    gen_random_uuid(),
    'The Ultimate Cookbook Collection',
    'Explore world cuisines with this comprehensive cookbook collection. This hardcover set includes over 500 recipes from international chefs, with detailed instructions and stunning photography. From beginner basics to advanced techniques, this collection will inspire cooks of all skill levels.',
    49.99,
    30,
    10, -- Books
    FALSE,
    TRUE,
    'BOOK-COOK-COL',
    3.8,
    '11 x 9 x 3',
    ARRAY['book', 'cookbook', 'recipes', 'cooking']
),
(
    gen_random_uuid(),
    'Modern Web Development: Complete Guide',
    'Master modern web development with this comprehensive guide. Covers HTML5, CSS3, JavaScript, React, Node.js, and more with practical examples and projects. Includes access to online resources with code samples and additional exercises. Perfect for beginners and experienced developers alike.',
    39.99,
    45,
    10, -- Books
    TRUE,
    TRUE,
    'BOOK-WEB-DEV',
    1.8,
    '9.5 x 7.5 x 1.5',
    ARRAY['book', 'programming', 'web development', 'coding']
);

-- Add product images for new products
INSERT INTO ecommerce.product_images (product_id, image_url, is_primary)
SELECT id, 'https://picsum.photos/id/' || (RANDOM() * 100)::integer || '/800/600', TRUE
FROM ecommerce.products
WHERE created_at > NOW() - INTERVAL '5 minutes';

-- Add additional images for featured products
INSERT INTO ecommerce.product_images (product_id, image_url, is_primary)
SELECT id, 'https://picsum.photos/id/' || (RANDOM() * 100 + 100)::integer || '/800/600', FALSE
FROM ecommerce.products
WHERE is_featured = TRUE AND created_at > NOW() - INTERVAL '5 minutes';

-- Add inventory for new products
INSERT INTO ecommerce.product_inventory (product_id, warehouse_id, quantity)
SELECT 
    p.id, 
    w.id, 
    (RANDOM() * p.stock_quantity)::integer
FROM 
    ecommerce.products p
CROSS JOIN 
    ecommerce.warehouses w
WHERE 
    p.created_at > NOW() - INTERVAL '5 minutes';

-- Create test user for product reviews
INSERT INTO ecommerce.users (
    id, username, email, password_hash, first_name, last_name
)
VALUES (
    '96a86602-f370-41f2-ad31-ab725f14e11e', 
    'testuser', 
    'user@example.com', 
    'password_hash_value',
    'Test',
    'User'
)
ON CONFLICT (id) DO NOTHING;

-- Generate random product reviews
INSERT INTO ecommerce.product_reviews (id, product_id, user_id, rating, review_text, created_at, updated_at)
WITH recent_product AS (
  SELECT id FROM ecommerce.products 
  WHERE created_at > NOW() - INTERVAL '5 minutes' 
  ORDER BY created_at DESC LIMIT 1
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM recent_product),
  '96a86602-f370-41f2-ad31-ab725f14e11e'::uuid,
  5,
  'This product exceeded my expectations. Will definitely buy again...',
  NOW(),
  NOW()
UNION ALL SELECT
  gen_random_uuid(),
  (SELECT id FROM recent_product),
  '96a86602-f370-41f2-ad31-ab725f14e11e'::uuid,
  4,
  'Great product, fast shipping!',
  NOW(),
  NOW()
UNION ALL SELECT
  gen_random_uuid(),
  (SELECT id FROM recent_product),
  '96a86602-f370-41f2-ad31-ab725f14e11e'::uuid,
  5,
  'Excellent quality and value.',
  NOW(),
  NOW()
UNION ALL SELECT
  gen_random_uuid(),
  (SELECT id FROM recent_product),
  '96a86602-f370-41f2-ad31-ab725f14e11e'::uuid,
  4,
  'Very satisfied with my purchase.',
  NOW(),
  NOW()
UNION ALL SELECT
  gen_random_uuid(),
  (SELECT id FROM recent_product),
  '96a86602-f370-41f2-ad31-ab725f14e11e'::uuid,
  5,
  'Would recommend to friends and family!',
  NOW(),
  NOW()
UNION ALL SELECT
  gen_random_uuid(),
  (SELECT id FROM recent_product),
  '96a86602-f370-41f2-ad31-ab725f14e11e'::uuid,
  4,
  'Exactly as described. Very happy!',
  NOW(),
  NOW()
UNION ALL SELECT
  gen_random_uuid(),
  (SELECT id FROM recent_product),
  '96a86602-f370-41f2-ad31-ab725f14e11e'::uuid,
  5,
  'Perfect fit for my needs.',
  NOW(),
  NOW()
UNION ALL SELECT
  gen_random_uuid(),
  (SELECT id FROM recent_product),
  '96a86602-f370-41f2-ad31-ab725f14e11e'::uuid,
  4,
  'Good value for the price.',
  NOW(),
  NOW()
UNION ALL SELECT
  gen_random_uuid(),
  (SELECT id FROM recent_product),
  '96a86602-f370-41f2-ad31-ab725f14e11e'::uuid,
  5,
  'Amazing product quality!',
  NOW(),
  NOW()
UNION ALL SELECT
  gen_random_uuid(),
  (SELECT id FROM recent_product),
  '96a86602-f370-41f2-ad31-ab725f14e11e'::uuid,
  3,
  'Decent product, but shipping was slow.',
  NOW(),
  NOW(); 
