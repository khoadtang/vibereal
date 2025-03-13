const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Get all users (paginated)
  router.get('/', async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      // Intentionally inefficient query without proper indexing
      const query = `
        SELECT * 
        FROM ecommerce.users
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const countQuery = 'SELECT COUNT(*) FROM ecommerce.users';
      
      const [data, counts] = await Promise.all([
        pool.query(query, [limit, offset]),
        pool.query(countQuery)
      ]);
      
      const total = parseInt(counts.rows[0].count);
      
      res.json({
        data: data.rows,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // Search users by email (inefficient)
  router.get('/search', async (req, res, next) => {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ message: 'Email search term is required' });
      }
      
      // Intentionally inefficient search without proper indexing
      const query = `
        SELECT * 
        FROM ecommerce.users
        WHERE email ILIKE $1
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [`%${email}%`]);
      
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  // Get user by ID with order history
  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Get user details
      const userQuery = `
        SELECT u.*
        FROM ecommerce.users u
        WHERE u.id = $1
      `;
      
      // Get user's order history
      const ordersQuery = `
        SELECT o.*
        FROM ecommerce.orders o
        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
      `;
      
      const [userResult, ordersResult] = await Promise.all([
        pool.query(userQuery, [id]),
        pool.query(ordersQuery, [id])
      ]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = userResult.rows[0];
      
      // Remove sensitive information
      delete user.password_hash;
      
      res.json({
        ...user,
        orders: ordersResult.rows
      });
    } catch (err) {
      next(err);
    }
  });

  // Create a new user
  router.post('/', async (req, res, next) => {
    try {
      const { username, email, password, first_name, last_name, address, city, postal_code, country, phone } = req.body;
      
      // In a real app, we would hash the password here
      const password_hash = password; // This is just for demo purposes
      
      const query = `
        INSERT INTO ecommerce.users (username, email, password_hash, first_name, last_name, address, city, postal_code, country, phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, username, email, first_name, last_name, created_at
      `;
      
      const result = await pool.query(query, [
        username, email, password_hash, first_name, last_name, address, city, postal_code, country, phone
      ]);
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  return router;
}; 