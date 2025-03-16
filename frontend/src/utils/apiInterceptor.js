import axios from 'axios';

// Flag to track if we've already shown an error for the current request cycle
let hasShownError = false;

// Custom event for database connection errors
export const DB_CONNECTION_ERROR_EVENT = 'db_connection_error';

// Create a custom event to dispatch when a database connection error occurs
const dispatchDbConnectionError = (error) => {
  const event = new CustomEvent(DB_CONNECTION_ERROR_EVENT, { 
    detail: { 
      message: error?.message || 'Database connection error',
      status: error?.response?.status,
      isConnectionRefused: error?.message?.includes('ECONNREFUSED'),
      error
    } 
  });
  window.dispatchEvent(event);
};

// Initialize axios interceptors
export const initApiInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      // Reset error flag on new request
      hasShownError = false;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Check if error is related to database connection
      const isConnectionError = 
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('Network Error') ||
        error.message?.includes('connect failed');
      
      // Handle database connection errors
      if (isConnectionError && !hasShownError) {
        hasShownError = true;
        dispatchDbConnectionError(error);
      }
      
      return Promise.reject(error);
    }
  );
}; 
