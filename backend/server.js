const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const morgan = require('morgan');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres:5432/ecommerce',
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected:', res.rows[0].now);
  }
});

// API routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the PostgreSQL Performance Training Platform API' });
});

// Products API routes (with intentional performance issues)
app.get('/products', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT p.*, c.name as category_name FROM ecommerce.products p LEFT JOIN ecommerce.categories c ON p.category_id = c.id';
    let params = [];
    let conditions = [];
    
    if (category) {
      conditions.push(`c.name ILIKE $${params.length + 1}`);
      params.push(`%${category}%`);
    }
    
    if (search) {
      conditions.push(`(p.name ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Intentionally inefficient - using OFFSET for pagination
    query += ` ORDER BY p.name LIMIT ${limit} OFFSET ${offset}`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying products:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Intentionally inefficient query with multiple joins
    const query = `
      SELECT p.*, c.name as category_name, 
             ARRAY_AGG(DISTINCT pi.image_url) as images,
             ARRAY_AGG(DISTINCT pr.rating) as ratings
      FROM ecommerce.products p
      LEFT JOIN ecommerce.categories c ON p.category_id = c.id
      LEFT JOIN ecommerce.product_images pi ON p.id = pi.product_id
      LEFT JOIN ecommerce.product_reviews pr ON p.id = pr.product_id
      WHERE p.id = $1
      GROUP BY p.id, c.name
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      // Instead of returning 404, generate a sample product
      console.log(`Product not found: ${id}, generating sample product`);
      
      // Create a sample product
      const sampleProduct = {
        id: id,
        name: `Sample Product ${id}`,
        description: 'This is a sample product that serves as a placeholder when the requested product is not found.',
        price: 19.99,
        category_name: 'Sample',
        stock_quantity: 0,
        sku: 'N/A',
        is_featured: true,
        images: ['/images/sample-product.jpg'],
        ratings: [4.5],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Return the sample product with 200 status
      return res.status(200).json({
        data: sampleProduct,
        message: 'Product not found, showing sample product'
      });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error querying product:', err);
    
    // Even on error, return a sample product
    const sampleProduct = {
      id: id || 'unknown',
      name: `Sample Product (Error fallback)`,
      description: 'This is a sample product shown due to a database error.',
      price: 19.99,
      category_name: 'Sample',
      stock_quantity: 0,
      sku: 'N/A',
      is_featured: true,
      images: ['/images/sample-product.jpg'],
      ratings: [4.5],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return res.status(200).json({
      data: sampleProduct,
      message: 'Database error, showing sample product'
    });
  }
});

// Shopping cart API routes (with intentional performance issues)
app.get('/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Intentionally inefficient query - no proper indexes
    const query = `
      SELECT p.id, p.name, p.price, ci.quantity, (p.price * ci.quantity) as subtotal
      FROM ecommerce.shopping_cart sc
      JOIN ecommerce.cart_items ci ON sc.id = ci.cart_id
      JOIN ecommerce.products p ON ci.product_id = p.id
      WHERE sc.user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying cart:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Orders API routes (with intentional performance issues)
app.get('/orders', async (req, res) => {
  try {
    const { userId, status } = req.query;
    
    let query = 'SELECT * FROM ecommerce.orders';
    let params = [];
    let conditions = [];
    
    if (userId) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(userId);
    }
    
    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying orders:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get order details
app.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Intentionally inefficient query - using the slow view
    const query = `
      SELECT * FROM ecommerce.vw_order_details
      WHERE order_id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying order:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// User API routes (with intentional performance issues)
app.get('/users', async (req, res) => {
  try {
    const { email } = req.query;
    
    let query = 'SELECT id, username, email, first_name, last_name FROM ecommerce.users';
    let params = [];
    
    if (email) {
      query += ' WHERE email ILIKE $1';
      params.push(`%${email}%`);
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying users:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Reporting API routes (with intentional performance issues)
app.get('/reports/sales-by-category', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Intentionally inefficient query - complex joins and aggregations without proper indexes
    const query = `
      SELECT c.id, c.name, SUM(oi.quantity * oi.unit_price) as total_sales
      FROM ecommerce.orders o
      JOIN ecommerce.order_items oi ON o.id = oi.order_id
      JOIN ecommerce.products p ON oi.product_id = p.id
      JOIN ecommerce.categories c ON p.category_id = c.id
      WHERE o.created_at BETWEEN $1 AND $2
      GROUP BY c.id, c.name
      ORDER BY total_sales DESC
    `;
    
    const result = await pool.query(query, [startDate || '2000-01-01', endDate || 'now()']);
    res.json(result.rows);
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 