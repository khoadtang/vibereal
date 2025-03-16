const express = require('express');
const { updateDbStatus } = require('../middleware/dbStatusMiddleware');

module.exports = (pool) => {
  const router = express.Router();
  
  // Track initialization state
  let initStatus = {
    isInitializing: true,
    isComplete: false,
    startTime: new Date(),
    lastChecked: null,
    progress: 0,
    message: 'Database initialization in progress...',
    error: null
  };

  // Check if specific tables exist to determine progress
  const checkInitializationStatus = async () => {
    try {
      // Update lastChecked time
      initStatus.lastChecked = new Date();
      
      // Check for essential tables to determine progress
      const queries = [
        // Check if extensions are installed - 10% progress
        `SELECT COUNT(*) FROM pg_extension WHERE extname IN ('pg_trgm', 'uuid-ossp', 'pg_stat_statements')`,
        
        // Check if schema exists - 20% progress
        `SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = 'ecommerce'`,
        
        // Check essential tables - 40% progress (10% per table check)
        `SELECT COUNT(*) FROM information_schema.tables 
         WHERE table_schema = 'ecommerce' AND table_name = 'users'`,
         
        `SELECT COUNT(*) FROM information_schema.tables 
         WHERE table_schema = 'ecommerce' AND table_name = 'products'`,
         
        `SELECT COUNT(*) FROM information_schema.tables 
         WHERE table_schema = 'ecommerce' AND table_name = 'categories'`,
        
        // Check seed data - 60% progress
        `SELECT COUNT(*) FROM ecommerce.categories`,
        
        // Check if sample products exist - 80% progress
        `SELECT COUNT(*) FROM ecommerce.products WHERE created_at > NOW() - INTERVAL '1 day'`,
        
        // Check if sample product reviews exist - 100% progress
        `SELECT COUNT(*) > 0 FROM ecommerce.product_reviews`
      ];
      
      const messages = [
        'Installing database extensions...',
        'Creating database schema...',
        'Creating users table...',
        'Creating products table...',
        'Creating categories table...',
        'Loading sample data...',
        'Creating sample products...',
        'Creating sample reviews...'
      ];
      
      // Determine current progress
      for (let i = 0; i < queries.length; i++) {
        try {
          const result = await pool.query(queries[i]);
          const count = parseInt(result.rows[0].count, 10);
          
          if (count === 0) {
            // We found the current step
            initStatus.progress = Math.max(5, Math.round((i / queries.length) * 100));
            initStatus.message = messages[i];
            break;
          } else if (i === queries.length - 1) {
            // All steps completed
            initStatus.progress = 100;
            initStatus.message = 'Database initialization complete!';
            initStatus.isComplete = true;
            initStatus.isInitializing = false;
          }
        } catch (error) {
          // If query fails, assume this step is not yet complete
          initStatus.progress = Math.max(5, Math.round((i / queries.length) * 100));
          initStatus.message = messages[i];
          break;
        }
      }
      
      // Share status with middleware
      updateDbStatus(initStatus);
      
      return initStatus;
    } catch (error) {
      console.error('Error checking database status:', error);
      initStatus.error = error.message;
      
      // Share error status with middleware
      updateDbStatus(initStatus);
      
      return initStatus;
    }
  };
  
  // Get initialization status
  router.get('/', async (req, res) => {
    try {
      // If status was checked in the last 1 second and initialization is complete,
      // return cached result
      const now = new Date();
      if (initStatus.lastChecked && 
          (now - initStatus.lastChecked) < 1000 && 
          initStatus.isComplete) {
        return res.json(initStatus);
      }
      
      // Otherwise, check current status
      const status = await checkInitializationStatus();
      return res.json(status);
    } catch (error) {
      console.error('Error in initialization status endpoint:', error);
      return res.status(500).json({ 
        error: 'Failed to check initialization status',
        details: error.message
      });
    }
  });

  // Run initial check
  checkInitializationStatus()
    .then(() => {
      console.log(`Initial DB status check: ${initStatus.progress}% - ${initStatus.message}`);
      
      // Set up periodic checks during initialization
      const checkInterval = setInterval(() => {
        if (initStatus.isComplete) {
          console.log('Database initialization complete, stopping periodic checks');
          clearInterval(checkInterval);
        } else {
          console.log('Running periodic database status check...');
          checkInitializationStatus()
            .then(status => {
              console.log(`DB status: ${status.progress}% - ${status.message}`);
            })
            .catch(err => console.error('Failed periodic DB status check:', err));
        }
      }, 5000); // Check every 5 seconds during initialization
    })
    .catch(err => console.error('Failed initial DB status check:', err));
  
  return router;
}; 
