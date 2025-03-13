import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SQLCodeBlock from '../components/SQLCodeBlock';

const ChallengeDetail = () => {
  const { id } = useParams();
  
  // Mock challenge data - in a real app, this would come from an API
  const challenges = {
    '1': {
      title: 'Product Search Optimization',
      description: 'In this challenge, you will optimize product search queries to improve performance when searching through a large product catalog.',
      problem: 'The current product search query is slow, especially when searching by product name or description. The query uses ILIKE without proper indexes, resulting in sequential scans.',
      slowQuery: `
SELECT p.*, c.name as category_name 
FROM ecommerce.products p 
LEFT JOIN ecommerce.categories c ON p.category_id = c.id
WHERE p.name ILIKE '%laptop%' OR p.description ILIKE '%laptop%'
ORDER BY p.name
LIMIT 20 OFFSET 0;
      `,
      explainAnalyze: `
EXPLAIN ANALYZE
SELECT p.*, c.name as category_name 
FROM ecommerce.products p 
LEFT JOIN ecommerce.categories c ON p.category_id = c.id
WHERE p.name ILIKE '%laptop%' OR p.description ILIKE '%laptop%'
ORDER BY p.name
LIMIT 20 OFFSET 0;
      `,
      solution: `
-- Create a GIN index with pg_trgm for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for text search on name and description
CREATE INDEX idx_products_name_trgm ON ecommerce.products USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_description_trgm ON ecommerce.products USING gin(description gin_trgm_ops);

-- Create index for the category join
CREATE INDEX idx_products_category_id ON ecommerce.products(category_id);

-- Rewrite the query to use the indexes effectively
SELECT p.*, c.name as category_name 
FROM ecommerce.products p 
LEFT JOIN ecommerce.categories c ON p.category_id = c.id
WHERE p.name ILIKE '%laptop%' OR p.description ILIKE '%laptop%'
ORDER BY p.name
LIMIT 20;
      `,
      tips: [
        'Use the pg_trgm extension for efficient text search with LIKE/ILIKE',
        'Create GIN indexes for text columns that need pattern matching',
        'Add regular B-tree indexes for join columns',
        'Consider using full-text search (tsvector/tsquery) for more advanced text search capabilities',
        'Avoid using OFFSET for pagination with large result sets'
      ]
    },
    '2': {
      title: 'Shopping Cart Performance',
      description: 'In this challenge, you will optimize shopping cart queries to improve performance when retrieving and updating cart items.',
      problem: 'The current shopping cart query is slow due to missing indexes and foreign key constraints. The query joins multiple tables without proper indexing.',
      slowQuery: `
SELECT p.id, p.name, p.price, ci.quantity, (p.price * ci.quantity) as subtotal
FROM ecommerce.shopping_cart sc
JOIN ecommerce.cart_items ci ON sc.id = ci.cart_id
JOIN ecommerce.products p ON ci.product_id = p.id
WHERE sc.user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      `,
      explainAnalyze: `
EXPLAIN ANALYZE
SELECT p.id, p.name, p.price, ci.quantity, (p.price * ci.quantity) as subtotal
FROM ecommerce.shopping_cart sc
JOIN ecommerce.cart_items ci ON sc.id = ci.cart_id
JOIN ecommerce.products p ON ci.product_id = p.id
WHERE sc.user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      `,
      solution: `
-- Add missing foreign key constraint
ALTER TABLE ecommerce.cart_items 
ADD CONSTRAINT fk_cart_items_product_id 
FOREIGN KEY (product_id) REFERENCES ecommerce.products(id);

-- Create indexes for the joins
CREATE INDEX idx_cart_items_cart_id ON ecommerce.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON ecommerce.cart_items(product_id);
CREATE INDEX idx_shopping_cart_user_id ON ecommerce.shopping_cart(user_id);

-- The query remains the same, but now uses indexes
SELECT p.id, p.name, p.price, ci.quantity, (p.price * ci.quantity) as subtotal
FROM ecommerce.shopping_cart sc
JOIN ecommerce.cart_items ci ON sc.id = ci.cart_id
JOIN ecommerce.products p ON ci.product_id = p.id
WHERE sc.user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      `,
      tips: [
        'Always add proper foreign key constraints for data integrity and query optimization',
        'Create indexes on columns used in JOIN conditions',
        'Create indexes on columns used in WHERE clauses',
        'Consider composite indexes for queries that filter on multiple columns',
        'Use EXPLAIN ANALYZE to verify that your indexes are being used'
      ]
    },
    '3': {
      title: 'Order Processing Efficiency',
      description: 'In this challenge, you will optimize order processing queries to improve performance when retrieving and analyzing order data.',
      problem: 'The current order details query is slow due to using an inefficient view and missing indexes. The query joins multiple tables without proper indexing.',
      slowQuery: `
SELECT * FROM ecommerce.vw_order_details
WHERE order_id = 'e47ac10b-58cc-4372-a567-0e02b2c3d479';
      `,
      explainAnalyze: `
EXPLAIN ANALYZE
SELECT * FROM ecommerce.vw_order_details
WHERE order_id = 'e47ac10b-58cc-4372-a567-0e02b2c3d479';
      `,
      solution: `
-- Add missing foreign key constraints
ALTER TABLE ecommerce.order_items 
ADD CONSTRAINT fk_order_items_order_id 
FOREIGN KEY (order_id) REFERENCES ecommerce.orders(id);

ALTER TABLE ecommerce.order_items 
ADD CONSTRAINT fk_order_items_product_id 
FOREIGN KEY (product_id) REFERENCES ecommerce.products(id);

-- Create indexes for the joins
CREATE INDEX idx_order_items_order_id ON ecommerce.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON ecommerce.order_items(product_id);

-- Create a materialized view for better performance
CREATE MATERIALIZED VIEW ecommerce.mv_order_details AS
SELECT 
    o.id AS order_id,
    o.created_at AS order_date,
    o.status,
    u.username,
    u.email,
    p.name AS product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS subtotal
FROM ecommerce.orders o
JOIN ecommerce.users u ON o.user_id = u.id
JOIN ecommerce.order_items oi ON o.id = oi.order_id
JOIN ecommerce.products p ON oi.product_id = p.id;

-- Create an index on the materialized view
CREATE UNIQUE INDEX idx_mv_order_details_order_id ON ecommerce.mv_order_details(order_id, product_name);

-- Query the materialized view instead
SELECT * FROM ecommerce.mv_order_details
WHERE order_id = 'e47ac10b-58cc-4372-a567-0e02b2c3d479';

-- Set up a refresh schedule for the materialized view
-- This would typically be done with a cron job or similar
-- REFRESH MATERIALIZED VIEW ecommerce.mv_order_details;
      `,
      tips: [
        'Use materialized views for complex queries that are run frequently but don\'t need real-time data',
        'Create indexes on materialized views for faster querying',
        'Set up a refresh schedule for materialized views based on your data update frequency',
        'Consider using CONCURRENTLY when refreshing materialized views in production',
        'For real-time data needs, optimize the original query with proper indexes instead'
      ]
    },
    // Add more challenges as needed
  };
  
  const challenge = challenges[id];
  
  if (!challenge) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Challenge not found</h2>
        <p className="mb-6">The challenge you're looking for doesn't exist.</p>
        <Link to="/challenges" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
          Back to Challenges
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/challenges" className="text-blue-600 hover:text-blue-800 flex items-center">
          ← Back to Challenges
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>
      
      <section className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-2">Challenge Description</h2>
        <p className="mb-0">{challenge.description}</p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">The Problem</h2>
        <p className="mb-4">{challenge.problem}</p>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Slow Query:</h3>
          <SQLCodeBlock sql={challenge.slowQuery} />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">EXPLAIN ANALYZE:</h3>
          <SQLCodeBlock sql={challenge.explainAnalyze} />
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Solution</h2>
        <SQLCodeBlock sql={challenge.solution} />
      </section>
      
      <section className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Tips & Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          {challenge.tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ChallengeDetail; 