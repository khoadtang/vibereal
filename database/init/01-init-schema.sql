-- Create the ecommerce schema
CREATE SCHEMA IF NOT EXISTS ecommerce;

-- Set search path to the ecommerce schema
SET search_path TO ecommerce;

-- Create users table with address column
CREATE TABLE IF NOT EXISTS ecommerce.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create product categories table
CREATE TABLE IF NOT EXISTS ecommerce.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES ecommerce.categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS ecommerce.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    category_id UUID REFERENCES ecommerce.categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create shopping cart table
CREATE TABLE IF NOT EXISTS ecommerce.shopping_cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES ecommerce.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cart items table
CREATE TABLE IF NOT EXISTS ecommerce.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES ecommerce.shopping_cart(id),
    product_id UUID REFERENCES ecommerce.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS ecommerce.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES ecommerce.users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order items table
CREATE TABLE IF NOT EXISTS ecommerce.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES ecommerce.orders(id),
    product_id UUID REFERENCES ecommerce.products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add comments to tables
COMMENT ON TABLE ecommerce.users IS 'User accounts for the e-commerce platform';
COMMENT ON TABLE ecommerce.categories IS 'Product categories hierarchy';
COMMENT ON TABLE ecommerce.products IS 'Available products for sale';
COMMENT ON TABLE ecommerce.shopping_cart IS 'User shopping carts';
COMMENT ON TABLE ecommerce.cart_items IS 'Items in user shopping carts';
COMMENT ON TABLE ecommerce.orders IS 'Customer orders';
COMMENT ON TABLE ecommerce.order_items IS 'Line items for customer orders';
