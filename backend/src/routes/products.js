const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Get all products (paginated)
  // This query intentionally doesn't use proper indexing
  router.get('/', async (req, res, next) => {
    try {
      console.log('Product listing requested');
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search || '';
      const offset = (page - 1) * limit;
      
      console.log(`Fetching products - Page: ${page}, Limit: ${limit}, Search: "${search}"`);
      
      let query;
      let countQuery;
      let queryParams = [];
      let countParams = [];
      
      if (search) {
        query = `
          SELECT p.*, 
                 c.name as category_name,
                 (
                   SELECT ARRAY_AGG(pi.image_url)
                   FROM ecommerce.product_images pi
                   WHERE pi.product_id = p.id
                 ) as images
          FROM ecommerce.products p
          LEFT JOIN ecommerce.categories c ON p.category_id = c.id
          WHERE p.name ILIKE $1 OR p.description ILIKE $1
          ORDER BY p.name
          LIMIT $2 OFFSET $3
        `;
        queryParams = [`%${search}%`, limit, offset];
        
        countQuery = `
          SELECT COUNT(*) FROM ecommerce.products 
          WHERE name ILIKE $1 OR description ILIKE $1
        `;
        countParams = [`%${search}%`];
      } else {
        query = `
          SELECT p.*, 
                 c.name as category_name,
                 (
                   SELECT ARRAY_AGG(pi.image_url)
                   FROM ecommerce.product_images pi
                   WHERE pi.product_id = p.id
                 ) as images
          FROM ecommerce.products p
          LEFT JOIN ecommerce.categories c ON p.category_id = c.id
          ORDER BY p.name
          LIMIT $1 OFFSET $2
        `;
        queryParams = [limit, offset];
        
        countQuery = `SELECT COUNT(*) FROM ecommerce.products`;
        countParams = [];
      }
      
      try {
        const startTime = Date.now();
        const result = await pool.query(query, queryParams);
        const totalResult = await pool.query(countQuery, countParams);
        const endTime = Date.now();
        
        console.log(`Products query completed in ${endTime - startTime}ms, found ${result.rows.length} products`);
        
        if (result.rows.length === 0 && page > 1) {
          console.log('No products found on specified page, returning first page');
          // If no products on current page but page > 1, return first page
          const firstPageResult = await pool.query(
            search ? 
              `SELECT * FROM ecommerce.products WHERE name ILIKE $1 OR description ILIKE $1 ORDER BY name LIMIT $2` : 
              `SELECT * FROM ecommerce.products ORDER BY name LIMIT $1`,
            search ? [`%${search}%`, limit] : [limit]
          );
          
          return res.json({
            data: firstPageResult.rows,
            meta: {
              total: parseInt(totalResult.rows[0].count),
              page: 1,
              limit,
              pages: Math.ceil(parseInt(totalResult.rows[0].count) / limit)
            },
            message: 'Redirected to first page as requested page had no results'
          });
        }
        
        const total = parseInt(totalResult.rows[0].count);
        
        res.json({
          data: result.rows,
          meta: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (dbError) {
        console.error('Database error in products route:', dbError);
        
        // Return sample products as fallback
        const sampleProducts = [
          {
            id: 1,
            name: 'Sample Product 1',
            description: 'This is a sample product when the database is unavailable',
            price: 19.99,
            category: 'Sample',
            image_url: '/images/sample-product.jpg',
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: 2,
            name: 'Sample Product 2',
            description: 'Another sample product for display purposes',
            price: 29.99,
            category: 'Sample',
            image_url: '/images/sample-product.jpg',
            created_at: new Date(),
            updated_at: new Date()
          }
        ];
        
        res.json({
          data: sampleProducts,
          meta: {
            total: sampleProducts.length,
            page: 1,
            limit: sampleProducts.length,
            pages: 1
          },
          error: 'Database error, showing sample products',
          dbErrorMessage: dbError.message
        });
      }
    } catch (err) {
      console.error('Unexpected error in products route:', err);
      
      // Return sample products as ultimate fallback
      const fallbackProducts = [
        {
          id: 999,
          name: 'Fallback Product',
          description: 'Emergency fallback product when an unexpected error occurs',
          price: 9.99,
          category: 'Fallback',
          image_url: '/images/fallback-product.jpg',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      res.status(500).json({
        data: fallbackProducts,
        meta: {
          total: fallbackProducts.length,
          page: 1,
          limit: fallbackProducts.length,
          pages: 1
        },
        error: 'An unexpected error occurred, showing fallback product',
        errorMessage: err.message
      });
    }
  });

  // Helper function to generate sample products when needed
  function generateSampleProducts(count) {
    const categories = [
      'Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Toys', 
      'Sports', 'Beauty', 'Health', 'Automotive', 'Grocery'
    ];
    
    const products = [];
    
    for (let i = 1; i <= count; i++) {
      const categoryIndex = Math.floor(Math.random() * categories.length);
      const price = (Math.random() * 500 + 10).toFixed(2);
      
      products.push({
        id: `sample-${i}`,
        name: `Sample Product ${i}`,
        description: `This is a sample product description for product ${i}. It contains details about features and specifications.`,
        price: price,
        category_id: categoryIndex + 1,
        category_name: categories[categoryIndex],
        stock_quantity: Math.floor(Math.random() * 100),
        is_featured: Math.random() > 0.8,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    return products;
  }

  // Search products (intentionally inefficient search)
  router.get('/search', async (req, res, next) => {
    try {
      const { term } = req.query;
      
      if (!term) {
        return res.status(400).json({ message: 'Search term is required' });
      }
      
      // Intentionally inefficient search query that's ripe for optimization
      const query = `
        SELECT * FROM ecommerce.products 
        WHERE name ILIKE $1 OR description ILIKE $1
        ORDER BY name ASC
      `;
      
      const result = await pool.query(query, [`%${term}%`]);
      
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  // Get products by category (intentionally missing index)
  router.get('/category/:categoryId', async (req, res, next) => {
    try {
      const { categoryId } = req.params;
      
      // Intentionally inefficient query without proper indexing
      const query = `
        SELECT p.*, c.name as category_name
        FROM ecommerce.products p
        JOIN ecommerce.categories c ON p.category_id = c.id
        WHERE p.category_id = $1
        ORDER BY p.name ASC
      `;
      
      const result = await pool.query(query, [categoryId]);
      
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  // Get a specific product
  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      console.log(`Fetching specific product with ID: ${id}`);
      
      // Determine if this is a UUID or a simple numeric ID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const isNumeric = /^\d+$/.test(id);
      
      console.log(`ID type: ${isUUID ? 'UUID' : (isNumeric ? 'Numeric' : 'Other')}`);
      
      let query;
      let params;
      
      if (isUUID) {
        query = `
          SELECT p.*, 
                 c.name as category_name,
                 ARRAY_AGG(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images
          FROM ecommerce.products p
          LEFT JOIN ecommerce.categories c ON p.category_id = c.id
          LEFT JOIN ecommerce.product_images pi ON p.id = pi.product_id
          WHERE p.id = $1
          GROUP BY p.id, c.name
        `;
        params = [id];
      } else if (isNumeric) {
        // If it's a numeric ID, we'll try to find a product with that ID cast to int
        query = `
          SELECT p.*, 
                 c.name as category_name,
                 ARRAY_AGG(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images
          FROM ecommerce.products p
          LEFT JOIN ecommerce.categories c ON p.category_id = c.id
          LEFT JOIN ecommerce.product_images pi ON p.id = pi.product_id
          WHERE p.id::text = $1 OR CAST(p.id AS varchar) LIKE $2
          GROUP BY p.id, c.name
        `;
        params = [id, `%${id}%`];
      } else {
        return res.status(400).json({ message: 'Invalid product ID format' });
      }
      
      try {
        const startTime = Date.now();
        const result = await pool.query(query, params);
        const endTime = Date.now();
        
        console.log(`Product query completed in ${endTime - startTime}ms`);
        
        if (result.rows.length === 0) {
          console.log(`Product not found with ID: ${id}`);
          
          // Return a sample product if not found
          const sampleProduct = {
            id: isUUID ? id : `00000000-0000-4000-a000-000000000${id.padStart(3, '0')}`,
            name: `Sample Product ${id}`,
            description: 'This is a sample product that serves as a placeholder when the requested product is not found.',
            price: 19.99,
            category: 'Sample',
            image_url: '/images/sample-product.jpg',
            images: ['/images/sample-product.jpg'],
            created_at: new Date(),
            updated_at: new Date()
          };
          
          return res.status(200).json({ 
            data: sampleProduct,
            message: 'Product not found, showing sample product'
          });
        }
        
        res.json({ data: result.rows[0] });
      } catch (dbError) {
        console.error('Database error in specific product route:', dbError);
        
        // Return sample product as fallback
        const sampleProduct = {
          id: isUUID ? id : `00000000-0000-4000-a000-000000000${id.padStart(3, '0')}`,
          name: `Sample Product (ID: ${id})`,
          description: 'This is a sample product returned due to a database error.',
          price: 24.99,
          category: 'Sample',
          image_url: '/images/sample-product.jpg',
          images: ['/images/sample-product.jpg'],
          created_at: new Date(),
          updated_at: new Date()
        };
        
        res.json({
          data: sampleProduct,
          error: 'Database error, showing sample product',
          dbErrorMessage: dbError.message
        });
      }
    } catch (err) {
      console.error('Unexpected error in specific product route:', err);
      
      // Return sample product as ultimate fallback
      const fallbackProduct = {
        id: '00000000-0000-4000-a000-000000000999',
        name: 'Fallback Product',
        description: 'Emergency fallback product when an unexpected error occurs',
        price: 9.99,
        category: 'Fallback',
        image_url: '/images/fallback-product.jpg',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      res.status(500).json({
        data: fallbackProduct,
        error: 'An unexpected error occurred, showing fallback product',
        errorMessage: err.message
      });
    }
  });

  // Get product reviews (inefficient query)
  router.get('/:id/reviews', async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Intentionally inefficient query without proper indexing
      const query = `
        SELECT pr.*
        FROM ecommerce.product_reviews pr
        WHERE pr.product_id = $1
        ORDER BY pr.created_at DESC
      `;
      
      const result = await pool.query(query, [id]);
      
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  return router;
}; 
