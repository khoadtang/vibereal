const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 4000;

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres:5432/postgres'
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/products', require('./routes/products')(pool));
app.use('/api/users', require('./routes/users')(pool));
app.use('/api/cart', require('./routes/cart')(pool));
app.use('/api/orders', require('./routes/orders')(pool));
app.use('/api/metrics', require('./routes/metrics')(pool));
app.use('/api/challenges', require('./routes/challenges')(pool));
app.use('/api/reports', require('./routes/reports')(pool));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'PostgreSQL Performance Training Platform API',
    endpoints: {
      products: '/api/products',
      users: '/api/users',
      cart: '/api/cart',
      orders: '/api/orders',
      metrics: '/api/metrics',
      challenges: '/api/challenges'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  
  // Test database connection
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('Database connected successfully at:', result.rows[0].now);
    }
  });
}); 