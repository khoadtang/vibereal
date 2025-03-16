/**
 * Middleware to check database status before processing API requests
 * This will intercept database connection errors and provide helpful messages
 */

// Initialize with default values
let dbStatus = {
  isInitializing: true,
  isComplete: false,
  startTime: new Date(),
  lastChecked: null,
  progress: 0,
  message: 'Database initialization in progress...',
  error: null
};

// Track database connection attempts
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;
let lastConnectionAttempt = null;

/**
 * Updates the database status
 * @param {Object} status - The current database status
 */
function updateDbStatus(status) {
  dbStatus = { ...status };
  
  // If database is now connected, reset connection attempts
  if (status.isComplete) {
    connectionAttempts = 0;
  }
}

/**
 * Middleware function to check database connection before proceeding
 * @param {Object} pool - PostgreSQL connection pool
 */
function dbStatusMiddleware(pool) {
  return async (req, res, next) => {
    // Skip check for db-status endpoint to avoid circular references
    if (req.path === '/api/db-status' || req.path === '/health') {
      return next();
    }
    
    // If too many failed attempts in short succession, assume database is down
    const now = new Date();
    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS && 
        lastConnectionAttempt && 
        (now - lastConnectionAttempt) < 60000) { // Within last minute
      
      console.log(`Too many failed connection attempts (${connectionAttempts}), assuming database is unavailable`);
      
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'The database service is currently unavailable. Please try again later.',
        status: 'unavailable',
        progress: 0,
        details: 'Database service needs to be restarted',
        retryAfter: 30 // seconds
      });
    }
    
    try {
      // Try a simple query to check connection
      await pool.query('SELECT 1');
      // If successful, proceed to the next middleware
      connectionAttempts = 0;
      next();
    } catch (error) {
      console.error('Database connection error in middleware:', error.message);
      
      // Update connection attempt tracking
      connectionAttempts++;
      lastConnectionAttempt = new Date();
      
      // Return an informative error response
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'The database is currently initializing or unavailable',
        status: dbStatus.isInitializing ? 'initializing' : 'error',
        progress: dbStatus.progress,
        details: dbStatus.message,
        retryAfter: 5 // seconds
      });
    }
  };
}

module.exports = {
  dbStatusMiddleware,
  updateDbStatus
}; 
