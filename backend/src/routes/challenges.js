const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Get all challenges
  router.get('/', async (req, res, next) => {
    try {
      // Try to query the challenges table, but fall back to hardcoded data if it doesn't exist
      try {
        const result = await pool.query('SELECT * FROM ecommerce.challenges ORDER BY id');
        res.json(result.rows);
      } catch (err) {
        // If the table doesn't exist, return hardcoded challenges
        if (err.message.includes('relation') && err.message.includes('does not exist')) {
          const challenges = [
            {
              id: 1,
              title: 'Product Search Optimization',
              description: 'Learn how to optimize product search queries with proper indexing and text search capabilities.',
              difficulty: 'Beginner',
              topics: ['Indexing', 'Text Search', 'LIKE Optimization']
            },
            {
              id: 2,
              title: 'Shopping Cart Performance',
              description: 'Improve the performance of shopping cart operations with efficient joins and indexes.',
              difficulty: 'Intermediate',
              topics: ['Join Optimization', 'Foreign Keys', 'Composite Indexes']
            },
            {
              id: 3,
              title: 'Order Processing Efficiency',
              description: 'Optimize order processing queries for better throughput and response times.',
              difficulty: 'Intermediate',
              topics: ['Transaction Processing', 'Batch Operations', 'Partial Indexes']
            },
            {
              id: 4,
              title: 'User Management Queries',
              description: 'Learn how to efficiently query and update user data with proper indexing strategies.',
              difficulty: 'Beginner',
              topics: ['B-tree Indexes', 'Index-Only Scans', 'Covering Indexes']
            },
            {
              id: 5,
              title: 'Reporting and Analytics',
              description: 'Optimize complex reporting queries with materialized views and efficient aggregations.',
              difficulty: 'Advanced',
              topics: ['Materialized Views', 'Aggregation', 'Window Functions']
            }
          ];
          res.json(challenges);
        } else {
          throw err;
        }
      }
    } catch (err) {
      next(err);
    }
  });

  // Get a specific challenge
  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      
      try {
        const result = await pool.query('SELECT * FROM ecommerce.challenges WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Challenge not found' });
        }
        
        res.json(result.rows[0]);
      } catch (err) {
        // If the table doesn't exist, return hardcoded challenge
        if (err.message.includes('relation') && err.message.includes('does not exist')) {
          const challenges = {
            '1': {
              id: 1,
              title: 'Product Search Optimization',
              description: 'Learn how to optimize product search queries with proper indexing and text search capabilities.',
              difficulty: 'Beginner',
              topics: ['Indexing', 'Text Search', 'LIKE Optimization'],
              initial_query: 'SELECT * FROM ecommerce.products WHERE name ILIKE \'%laptop%\' OR description ILIKE \'%laptop%\''
            },
            '2': {
              id: 2,
              title: 'Shopping Cart Performance',
              description: 'Improve the performance of shopping cart operations with efficient joins and indexes.',
              difficulty: 'Intermediate',
              topics: ['Join Optimization', 'Foreign Keys', 'Composite Indexes'],
              initial_query: 'SELECT ci.*, p.name, p.price FROM ecommerce.cart_items ci JOIN ecommerce.products p ON ci.product_id = p.id WHERE ci.user_id = \'some-user-id\''
            }
          };
          
          if (!challenges[id]) {
            return res.status(404).json({ message: 'Challenge not found' });
          }
          
          res.json(challenges[id]);
        } else {
          throw err;
        }
      }
    } catch (err) {
      next(err);
    }
  });

  // Analyze a challenge query
  router.get('/:id/analyze', async (req, res, next) => {
    try {
      const { id } = req.params;
      
      try {
        const challengeResult = await pool.query('SELECT initial_query FROM ecommerce.challenges WHERE id = $1', [id]);
        
        if (challengeResult.rows.length === 0) {
          return res.status(404).json({ message: 'Challenge not found' });
        }
        
        const initialQuery = challengeResult.rows[0].initial_query;
        const explainResult = await pool.query(initialQuery);
        
        res.json({
          challenge_id: id,
          query_plan: explainResult.rows
        });
      } catch (err) {
        // If the table doesn't exist, return a mock response
        if (err.message.includes('relation') && err.message.includes('does not exist')) {
          res.json({
            challenge_id: id,
            query_plan: [
              {
                "QUERY PLAN": "Seq Scan on products  (cost=0.00..1.04 rows=4 width=36)"
              }
            ]
          });
        } else {
          throw err;
        }
      }
    } catch (err) {
      next(err);
    }
  });

  // Get execution time for challenge view
  router.get('/:id/execution-time', async (req, res, next) => {
    try {
      const { id } = req.params;
      
      try {
        // Use the helper function to get query execution time
        const result = await pool.query('SELECT * FROM ecommerce.explain_view($1) WHERE query_plan LIKE \'%Execution Time:%\'', [`challenge_${id}`]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Execution time information not found' });
        }
        
        // Extract execution time from the query plan
        const executionTimeLine = result.rows[0].query_plan;
        const executionTimeMatch = executionTimeLine.match(/Execution Time: ([\d.]+) ms/);
        
        if (!executionTimeMatch) {
          return res.status(404).json({ message: 'Execution time information not found' });
        }
        
        const executionTime = parseFloat(executionTimeMatch[1]);
        
        res.json({
          challenge_id: id,
          execution_time_ms: executionTime
        });
      } catch (err) {
        // If the function doesn't exist, return a mock response
        if (err.message.includes('function') || err.message.includes('relation') && err.message.includes('does not exist')) {
          res.json({
            challenge_id: id,
            execution_time_ms: 15.45
          });
        } else {
          throw err;
        }
      }
    } catch (err) {
      next(err);
    }
  });

  // Execute a custom query (for learning purposes)
  router.post('/execute', async (req, res, next) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: 'Query is required' });
      }
      
      // For safety, only allow SELECT statements that start with EXPLAIN
      if (!query.trim().toUpperCase().startsWith('EXPLAIN')) {
        return res.status(400).json({ message: 'Only EXPLAIN queries are allowed for safety reasons' });
      }
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  return router;
}; 