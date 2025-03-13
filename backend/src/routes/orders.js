const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Get all orders (paginated)
  router.get('/', async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const status = req.query.status;
      
      // Intentionally inefficient query without proper indexing
      let query = `
        SELECT o.*, u.username, u.email
        FROM ecommerce.orders o
        JOIN ecommerce.users u ON o.user_id = u.id
      `;
      
      let countQuery;
      let queryParams = [];
      
      if (status) {
        query += ` WHERE o.status = $1`;
        countQuery = 'SELECT COUNT(*) FROM ecommerce.orders WHERE status = $1';
        queryParams.push(status);
      } else {
        countQuery = 'SELECT COUNT(*) FROM ecommerce.orders';
      }
      
      query += ` ORDER BY o.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(limit, offset);
      
      const [data, counts] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(countQuery, status ? [status] : [])
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

  // Get orders by date range - intentionally inefficient
  router.get('/date-range', async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      // Intentionally inefficient date range query
      const query = `
        SELECT o.*, u.email,
               COUNT(oi.id) as items_count,
               SUM(oi.subtotal) as items_total
        FROM ecommerce.orders o
        JOIN ecommerce.users u ON o.user_id = u.id
        LEFT JOIN ecommerce.order_items oi ON o.id = oi.order_id
        WHERE o.created_at BETWEEN $1 AND $2
        GROUP BY o.id, u.email
        ORDER BY o.created_at DESC
      `;
      
      const result = await pool.query(query, [startDate, endDate]);
      
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  // Get a specific order with items - intentionally inefficient
  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Get order details
      const orderQuery = `
        SELECT o.*, u.username, u.email, u.first_name, u.last_name
        FROM ecommerce.orders o
        JOIN ecommerce.users u ON o.user_id = u.id
        WHERE o.id = $1
      `;
      
      // Get order items
      const itemsQuery = `
        SELECT oi.*, p.name, p.description, p.image_url
        FROM ecommerce.order_items oi
        JOIN ecommerce.products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `;
      
      const [orderResult, itemsResult] = await Promise.all([
        pool.query(orderQuery, [id]),
        pool.query(itemsQuery, [id])
      ]);
      
      if (orderResult.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json({
        ...orderResult.rows[0],
        items: itemsResult.rows
      });
    } catch (err) {
      next(err);
    }
  });

  // Get order statistics - intentionally inefficient aggregation
  router.get('/stats/overview', async (req, res, next) => {
    try {
      // Intentionally inefficient aggregation query
      const query = `
        SELECT 
          status,
          COUNT(*) as order_count,
          SUM(total_amount) as total_amount,
          MIN(created_at) as earliest_order,
          MAX(created_at) as latest_order,
          AVG(total_amount) as average_order_value
        FROM ecommerce.orders
        GROUP BY status
        ORDER BY status
      `;
      
      const result = await pool.query(query);
      
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  // Get top customers - intentionally inefficient report
  router.get('/stats/top-customers', async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      // Intentionally inefficient query for top customers report
      const query = `
        SELECT 
          u.id, 
          u.email, 
          u.first_name, 
          u.last_name,
          COUNT(o.id) as order_count,
          SUM(o.total_amount) as total_spent,
          AVG(o.total_amount) as average_order_value,
          MIN(o.created_at) as first_order_date,
          MAX(o.created_at) as last_order_date
        FROM ecommerce.orders o
        JOIN ecommerce.users u ON o.user_id = u.id
        GROUP BY u.id, u.email, u.first_name, u.last_name
        ORDER BY total_spent DESC
        LIMIT $1
      `;
      
      const result = await pool.query(query, [limit]);
      
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  // Create a new order
  router.post('/', async (req, res, next) => {
    try {
      const { user_id, items, shipping_address, payment_method } = req.body;
      
      if (!user_id || !items || !items.length) {
        return res.status(400).json({ message: 'User ID and at least one item are required' });
      }
      
      // Start a transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Calculate total amount
        let total_amount = 0;
        for (const item of items) {
          const productResult = await client.query('SELECT price FROM ecommerce.products WHERE id = $1', [item.product_id]);
          if (productResult.rows.length === 0) {
            throw new Error(`Product with ID ${item.product_id} not found`);
          }
          total_amount += productResult.rows[0].price * item.quantity;
        }
        
        // Create order
        const orderResult = await client.query(
          `INSERT INTO ecommerce.orders (user_id, total_amount, status, shipping_address, payment_method)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [user_id, total_amount, 'pending', shipping_address, payment_method]
        );
        
        const order_id = orderResult.rows[0].id;
        
        // Create order items
        for (const item of items) {
          const productResult = await client.query('SELECT name, price FROM ecommerce.products WHERE id = $1', [item.product_id]);
          await client.query(
            `INSERT INTO ecommerce.order_items (order_id, product_id, product_name, quantity, unit_price)
             VALUES ($1, $2, $3, $4, $5)`,
            [order_id, item.product_id, productResult.rows[0].name, item.quantity, productResult.rows[0].price]
          );
          
          // Update inventory (in a real app, we would check inventory first)
          await client.query(
            `UPDATE ecommerce.inventory SET quantity = quantity - $1 WHERE product_id = $2`,
            [item.quantity, item.product_id]
          );
        }
        
        // Clear cart items
        await client.query('DELETE FROM ecommerce.cart_items WHERE user_id = $1', [user_id]);
        
        await client.query('COMMIT');
        
        res.status(201).json(orderResult.rows[0]);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      next(err);
    }
  });

  // Update order status
  router.put('/:id/status', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const result = await pool.query(
        `UPDATE ecommerce.orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  return router;
}; 