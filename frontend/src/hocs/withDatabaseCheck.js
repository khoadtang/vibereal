import React from 'react';
import { useDatabaseConnection } from '../contexts/DatabaseConnectionContext';

/**
 * Higher-order component that adds database connection checking to any page component
 * 
 * @param {React.ComponentType} WrappedComponent - The component to wrap
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireConnection - Whether the component requires a database connection
 * @param {boolean} options.showWarning - Whether to show a warning message when database is not connected
 * @returns {React.ComponentType} - The wrapped component with database connection checking
 */
const withDatabaseCheck = (WrappedComponent, options = { requireConnection: true, showWarning: true }) => {
  return function WithDatabaseCheck(props) {
    const { databaseStatus } = useDatabaseConnection();
    
    // If database is connected or the component doesn't require connection, render normally
    if (databaseStatus.isConnected || !options.requireConnection) {
      return <WrappedComponent {...props} databaseStatus={databaseStatus} />;
    }
    
    // If component requires connection and database is not connected, show warning or fallback UI
    if (options.showWarning) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen p-8">
          <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-amber-100 p-2 mr-3">
                <svg className="w-6 h-6 text-amber-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-medium text-amber-800">
                {databaseStatus.isInitializing ? 'Database is initializing' : 'Database connection error'}
              </h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              {databaseStatus.isInitializing 
                ? `We're setting up the database (${databaseStatus.progress}% complete). This page will be available shortly.` 
                : 'We can\'t connect to the database right now. This page is temporarily unavailable.'}
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-amber-500 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                style={{ width: `${databaseStatus.progress}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              {databaseStatus.message || 'Please wait while we complete this process...'}
            </p>
            
            <div className="flex justify-center">
              <a href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Return to Homepage
              </a>
            </div>
          </div>
        </div>
      );
    }
    
    // If showWarning is false, render the component anyway
    return <WrappedComponent {...props} databaseStatus={databaseStatus} />;
  };
};

export default withDatabaseCheck; 
