import React from 'react';
import { useDatabaseConnection } from '../contexts/DatabaseConnectionContext';

const DatabaseConnectionAlert = () => {
  const { databaseStatus } = useDatabaseConnection();
  
  // Don't render anything if the database is connected
  if (databaseStatus.isConnected) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4 w-full">
        <div className="flex items-center mb-4">
          {databaseStatus.isInitializing ? (
            <div className="rounded-full bg-amber-100 p-2 mr-3">
              <svg className="w-6 h-6 text-amber-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          ) : (
            <div className="rounded-full bg-red-100 p-2 mr-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          )}
          <h3 className="text-lg font-medium text-gray-900">
            {databaseStatus.isInitializing ? 'Database is initializing' : 'Database connection error'}
          </h3>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {databaseStatus.message || 'We are currently setting up the database. Please wait while this process completes.'}
          </p>
          
          {databaseStatus.error && (
            <p className="text-xs text-red-600 mt-1">
              Error details: {databaseStatus.error}
            </p>
          )}
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${databaseStatus.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-right mt-1 text-gray-500">{databaseStatus.progress}% complete</p>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Some features may be unavailable until the database setup is complete. Please do not refresh the page.</p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectionAlert; 
