import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DB_CONNECTION_ERROR_EVENT } from '../utils/apiInterceptor';

// Create a context to track database connection status
export const DatabaseConnectionContext = createContext();

export const DatabaseConnectionProvider = ({ children }) => {
  const [databaseStatus, setDatabaseStatus] = useState({
    isConnected: false,
    isInitializing: true,
    message: 'Connecting to database...',
    progress: 0,
    lastUpdated: new Date(),
    error: null
  });

  // Function to check database connection status
  const checkDatabaseStatus = async () => {
    try {
      const response = await axios.get('/api/db-status');
      
      setDatabaseStatus({
        isConnected: response.data.isComplete,
        isInitializing: response.data.isInitializing,
        message: response.data.message,
        progress: response.data.progress,
        lastUpdated: new Date(),
        error: response.data.error
      });
      
      return response.data.isComplete;
    } catch (error) {
      // If we can't even connect to the API, the server itself might be starting up
      setDatabaseStatus({
        isConnected: false,
        isInitializing: true,
        message: 'Connecting to backend server...',
        progress: 0,
        lastUpdated: new Date(),
        error: error.message
      });
      
      return false;
    }
  };

  // Check database status on initial load and periodically
  useEffect(() => {
    let intervalId;
    
    const pollDatabaseStatus = async () => {
      const isConnected = await checkDatabaseStatus();
      
      // If database is connected, we can reduce polling frequency
      if (isConnected) {
        clearInterval(intervalId);
        // Check again every 10 seconds in case database goes down
        intervalId = setInterval(checkDatabaseStatus, 10000);
      }
    };
    
    // Check immediately on load
    pollDatabaseStatus();
    
    // Poll every 2 seconds until connected
    intervalId = setInterval(pollDatabaseStatus, 2000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Listen for database connection error events
  useEffect(() => {
    const handleDbConnectionError = (event) => {
      const { message, isConnectionRefused } = event.detail;
      
      // Update the database status with the error information
      setDatabaseStatus(prev => ({
        ...prev,
        isConnected: false,
        isInitializing: isConnectionRefused, // If connection refused, assume we're still initializing
        message: isConnectionRefused ? 'Waiting for database to start...' : 'Database connection error',
        lastUpdated: new Date(),
        error: message
      }));
      
      // Immediately check database status to get accurate information
      checkDatabaseStatus();
    };
    
    // Add event listener
    window.addEventListener(DB_CONNECTION_ERROR_EVENT, handleDbConnectionError);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener(DB_CONNECTION_ERROR_EVENT, handleDbConnectionError);
    };
  }, []);

  // Return context provider with current state and functions
  return (
    <DatabaseConnectionContext.Provider value={{ databaseStatus, checkDatabaseStatus }}>
      {children}
    </DatabaseConnectionContext.Provider>
  );
};

// Custom hook for using the database connection context
export const useDatabaseConnection = () => {
  const context = useContext(DatabaseConnectionContext);
  if (!context) {
    throw new Error('useDatabaseConnection must be used within a DatabaseConnectionProvider');
  }
  return context;
}; 
