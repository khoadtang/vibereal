const express = require('express');

module.exports = (pool) => {
  const router = express.Router();
  
  // Simple function to generate UUIDs for testing
  function generateSimpleUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, 
            v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // Helper function to ensure a sample user exists
  async function ensureSampleUserExists(userId) {
    try {
      // Check if the user exists
      const userQuery = `SELECT id FROM ecommerce.users WHERE id = $1`;
      const userResult = await pool.query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        console.log(`Sample user ${userId} doesn't exist, creating it`);
        
        // Create a sample user with the requested ID
        const insertQuery = `
          INSERT INTO ecommerce.users (
            id, username, email, password_hash, address
          ) 
          VALUES (
            $1, $2, $3, $4, $5
          )
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        `;
        
        const username = `user_${userId.substring(0, 8)}`;
        const email = `${username}@example.com`;
        
        await pool.query(insertQuery, [
          userId,
          username,
          email,
          'sample_password_hash',
          '123 Sample St, Sample City, Sample Country'
        ]);
        
        return true;
      } else {
        console.log(`Sample user ${userId} already exists`);
        return true;
      }
    } catch (error) {
      console.error(`Error ensuring sample user exists: ${error}`);
      return false;
    }
  }

  // Helper function to ensure a sample category exists
  async function ensureSampleCategoryExists() {
    try {
      // Use a consistent integer for the sample category
      const sampleCategoryId = 9999;
      
      // Check if the sample category exists
      const categoryQuery = `SELECT id FROM ecommerce.categories WHERE id = $1`;
      const categoryResult = await pool.query(categoryQuery, [sampleCategoryId]);
      
      if (categoryResult.rows.length === 0) {
        console.log('Sample category does not exist, creating it');
        
        // Create a sample category
        const insertQuery = `
          INSERT INTO ecommerce.categories (
            id, name, description
          ) 
          VALUES (
            $1, $2, $3
          )
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        `;
        
        await pool.query(insertQuery, [
          sampleCategoryId,
          'Sample Category',
          'This is a sample category for testing purposes'
        ]);
        
        console.log(`Created sample category with ID ${sampleCategoryId}`);
      } else {
        console.log('Sample category already exists');
      }
      
      return sampleCategoryId;
    } catch (error) {
      console.error('Error ensuring sample category exists:', error);
      return null;
    }
  }

  // Helper function to ensure a product exists
  async function ensureProductExists(productId) {
    try {
      // Make sure we have a sample category
      const categoryId = await ensureSampleCategoryExists();
      
      if (!categoryId) {
        console.error('Failed to ensure sample category exists');
        return false;
      }
      
      // Check if the product exists
      const productQuery = `SELECT id FROM ecommerce.products WHERE id = $1`;
      const productResult = await pool.query(productQuery, [productId]);
      
      if (productResult.rows.length === 0) {
        console.log(`Product ${productId} not found, creating a sample product`);
        
        // Create a new sample product with this ID
        const newProductQuery = `
          INSERT INTO ecommerce.products (
            id, name, description, price, image_url, category_id
          )
          VALUES (
            $1, $2, $3, $4, $5, $6
          )
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        `;
        
        // Insert a sample product
        await pool.query(newProductQuery, [
          productId,
          `Sample Product ${productId.substring(0, 6)}`,
          'This is a sample product created for testing purposes.',
          19.99,
          `https://picsum.photos/id/${Math.floor(Math.random() * 30) + 10}/400/400`,
          categoryId
        ]);
        
        console.log(`Created sample product with ID ${productId}`);
        return true;
      }
      
      console.log(`Product ${productId} already exists`);
      return true;
    } catch (error) {
      console.error('Error ensuring product exists:', error);
      return false;
    }
  }

  // Get user's cart
  router.get('/:userId', async (req, res, next) => {
    try {
      const { userId } = req.params;
      console.log(`Fetching cart for user ID: ${userId}`);
      
      // Ensure the user exists
      await ensureSampleUserExists(userId);
      
      // First get or create the shopping cart for this user
      try {
        let cartResult = await pool.query(
          `SELECT id FROM ecommerce.shopping_cart WHERE user_id = $1`,
          [userId]
        );
        
        let cartId;
        
        if (cartResult.rows.length === 0) {
          // Create a new cart
          console.log(`Creating new cart for user ${userId}`);
          const newCartResult = await pool.query(
            `INSERT INTO ecommerce.shopping_cart (user_id) VALUES ($1) RETURNING id`,
            [userId]
          );
          cartId = newCartResult.rows[0].id;
        } else {
          cartId = cartResult.rows[0].id;
          console.log(`Found existing cart with ID: ${cartId}`);
        }
        
        // Now get the cart items
        const query = `
          SELECT ci.*, p.name, p.description, p.price
          FROM ecommerce.cart_items ci
          JOIN ecommerce.products p ON ci.product_id = p.id
          WHERE ci.cart_id = $1
        `;
        
        console.log('Executing query:', query.replace(/\s+/g, ' ').trim());
        console.log('Query parameters:', [cartId]);
        
        const result = await pool.query(query, [cartId]);
        
        // Calculate total
        let total = 0;
        for (const item of result.rows) {
          total += parseFloat(item.price) * item.quantity;
        }
        
        console.log(`Found ${result.rows.length} items in cart, total: ${total}`);
        res.json({
          items: result.rows,
          total
        });
      } catch (dbError) {
        console.error('Database error when fetching cart:', dbError);
        
        // Return empty cart instead of failing
        res.json({
          items: [],
          total: 0,
          error: dbError.message
        });
      }
    } catch (err) {
      console.error('General error in cart route:', err);
      res.status(500).json({ 
        message: 'An error occurred while fetching your cart',
        error: err.message,
        items: [],
        total: 0
      });
    }
  });

  // Get cart item count for a user - intentionally inefficient
  router.get('/user/:userId/count', async (req, res, next) => {
    try {
      const { userId } = req.params;
      
      // Intentionally inefficient query that should use an index
      const query = `
        SELECT SUM(quantity) as item_count
        FROM ecommerce.cart_items
        WHERE user_id = $1
      `;
      
      const result = await pool.query(query, [userId]);
      
      res.json({
        itemCount: parseInt(result.rows[0].item_count) || 0
      });
    } catch (err) {
      next(err);
    }
  });

  // Get cart item details - intentionally inefficient
  router.get('/item/:itemId', async (req, res, next) => {
    try {
      const { itemId } = req.params;
      
      // Intentionally inefficient query with unnecessary joins
      const query = `
        SELECT ci.*, 
               p.name, p.price, p.image_url, p.sku,
               u.username, u.email
        FROM ecommerce.cart_items ci
        JOIN ecommerce.products p ON ci.product_id = p.id
        JOIN ecommerce.users u ON ci.user_id = u.id
        WHERE ci.id = $1
      `;
      
      const result = await pool.query(query, [itemId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // Add item to cart
  router.post('/', async (req, res, next) => {
    try {
      const { user_id, product_id, quantity } = req.body;
      console.log(`Adding item to cart - User: ${user_id}, Product: ${product_id}, Quantity: ${quantity}`);
      
      if (!user_id || !product_id || !quantity) {
        return res.status(400).json({ message: 'User ID, product ID, and quantity are required' });
      }
      
      // Ensure the user exists in the database
      const userExists = await ensureSampleUserExists(user_id);
      if (!userExists) {
        return res.status(400).json({ 
          message: 'Could not create or verify user in the database',
        });
      }
      
      // Ensure the product exists in the database
      const productExists = await ensureProductExists(product_id);
      if (!productExists) {
        return res.status(400).json({
          message: 'Could not create or verify product in the database',
        });
      }
      
      // Check if product exists
      try {
        const productQuery = `SELECT * FROM ecommerce.products WHERE id = $1`;
        const productResult = await pool.query(productQuery, [product_id]);
        
        if (productResult.rows.length === 0) {
          console.log(`Product not found: ${product_id}, creating a sample product for the cart`);
          
          // Instead of returning 404, create a sample product on the fly
          try {
            // Make sure we have a sample category
            const categoryId = await ensureSampleCategoryExists();
            
            // Create a sample product
            const createProductQuery = `
              INSERT INTO ecommerce.products (
                id, name, description, price, category_id, stock_quantity, is_featured
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              RETURNING *
            `;
            
            const newProductParams = [
              product_id,
              `Sample Product ${product_id.substring(0, 8)}`,
              'This is a sample product created automatically when adding to cart.',
              19.99,
              categoryId,
              100,
              true
            ];
            
            const newProductResult = await pool.query(createProductQuery, newProductParams);
            
            if (newProductResult.rows.length === 0) {
              return res.status(500).json({ message: 'Failed to create sample product' });
            }
            
            console.log(`Created sample product: ${newProductResult.rows[0].name}`);
            const createdProduct = newProductResult.rows[0];
            
            // Continue with the created product
            console.log(`Using created sample product: ${createdProduct.name}`);
          } catch (createError) {
            console.error('Error creating sample product:', createError);
            return res.status(500).json({ message: 'Error creating sample product', error: createError.message });
          }
        } else {
          console.log(`Product found: ${productResult.rows[0].name}`);
          
          // Check if product is in stock
          if (productResult.rows[0].stock_quantity <= 0) {
            return res.status(400).json({
              message: 'Cannot add product to cart: Product is out of stock',
              product: productResult.rows[0].name
            });
          }
        }
        
        // Get or create shopping cart
        let cartResult = await pool.query(
          `SELECT id FROM ecommerce.shopping_cart WHERE user_id = $1`,
          [user_id]
        );
        
        let cartId;
        
        if (cartResult.rows.length === 0) {
          // Create a new cart
          console.log(`Creating new cart for user ${user_id}`);
          const newCartResult = await pool.query(
            `INSERT INTO ecommerce.shopping_cart (user_id) VALUES ($1) RETURNING id`,
            [user_id]
          );
          cartId = newCartResult.rows[0].id;
        } else {
          cartId = cartResult.rows[0].id;
          console.log(`Found existing cart with ID: ${cartId}`);
        }
        
        // Check if item already in cart
        const checkQuery = `
          SELECT * FROM ecommerce.cart_items WHERE cart_id = $1 AND product_id = $2
        `;
        const checkResult = await pool.query(checkQuery, [cartId, product_id]);
        
        let result;
        
        if (checkResult.rows.length > 0) {
          // Update existing cart item
          const newQuantity = checkResult.rows[0].quantity + parseInt(quantity);
          console.log(`Updating existing cart item quantity to ${newQuantity}`);
          result = await pool.query(
            `UPDATE ecommerce.cart_items SET quantity = $1, updated_at = NOW() WHERE cart_id = $2 AND product_id = $3 RETURNING *`,
            [newQuantity, cartId, product_id]
          );
        } else {
          // Add new cart item
          console.log(`Adding new item to cart: ${product_id}`);
          result = await pool.query(
            `INSERT INTO ecommerce.cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *`,
            [cartId, product_id, quantity]
          );
        }
        
        console.log('Cart item added/updated successfully');
        res.status(201).json(result.rows[0]);
      } catch (dbError) {
        console.error('Database error when adding to cart:', dbError);
        
        if (dbError.constraint && dbError.constraint.includes('foreign key')) {
          return res.status(400).json({ 
            message: 'Cannot add this product to your cart. The product may not exist.',
            error: dbError.message
          });
        }
        
        res.status(500).json({ 
          message: 'An error occurred while adding the item to your cart',
          error: dbError.message
        });
      }
    } catch (err) {
      console.error('General error in add-to-cart route:', err);
      res.status(500).json({ 
        message: 'An unexpected error occurred',
        error: err.message
      });
    }
  });

  // Update cart item quantity
  router.put('/:userId/:productId', async (req, res, next) => {
    try {
      const { userId, productId } = req.params;
      const { quantity } = req.body;
      
      if (!quantity) {
        return res.status(400).json({ message: 'Quantity is required' });
      }
      
      // Get the cart ID
      const cartResult = await pool.query(
        `SELECT id FROM ecommerce.shopping_cart WHERE user_id = $1`,
        [userId]
      );
      
      if (cartResult.rows.length === 0) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      const cartId = cartResult.rows[0].id;
      
      if (parseInt(quantity) <= 0) {
        // Remove item if quantity is 0 or negative
        await pool.query(
          `DELETE FROM ecommerce.cart_items WHERE cart_id = $1 AND product_id = $2`,
          [cartId, productId]
        );
        
        return res.json({ message: 'Item removed from cart' });
      }
      
      // Update quantity
      const result = await pool.query(
        `UPDATE ecommerce.cart_items SET quantity = $1, updated_at = NOW() WHERE cart_id = $2 AND product_id = $3 RETURNING *`,
        [quantity, cartId, productId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // Remove item from cart
  router.delete('/:userId/:productId', async (req, res, next) => {
    try {
      const { userId, productId } = req.params;
      
      // Get the cart ID
      const cartResult = await pool.query(
        `SELECT id FROM ecommerce.shopping_cart WHERE user_id = $1`,
        [userId]
      );
      
      if (cartResult.rows.length === 0) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      const cartId = cartResult.rows[0].id;
      
      await pool.query(
        `DELETE FROM ecommerce.cart_items WHERE cart_id = $1 AND product_id = $2`,
        [cartId, productId]
      );
      
      res.json({ message: 'Item removed from cart' });
    } catch (err) {
      next(err);
    }
  });

  // Clear all items from cart
  router.delete('/:userId', async (req, res, next) => {
    try {
      const { userId } = req.params;
      console.log(`Clearing all items from cart for user: ${userId}`);
      
      // Get the cart ID
      const cartResult = await pool.query(
        `SELECT id FROM ecommerce.shopping_cart WHERE user_id = $1`,
        [userId]
      );
      
      if (cartResult.rows.length === 0) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      const cartId = cartResult.rows[0].id;
      
      // Delete all items from the cart
      const result = await pool.query(
        `DELETE FROM ecommerce.cart_items WHERE cart_id = $1 RETURNING *`,
        [cartId]
      );
      
      const deletedCount = result.rowCount || 0;
      console.log(`Deleted ${deletedCount} items from cart ${cartId}`);
      
      res.json({ 
        message: 'Cart cleared successfully', 
        deletedCount 
      });
    } catch (err) {
      console.error('Error clearing cart:', err);
      next(err);
    }
  });

  return router;
}; 
