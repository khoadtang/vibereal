import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DatabaseInitStatus = () => {
  const [status, setStatus] = useState({
    isInitializing: true,
    isComplete: false,
    progress: 0,
    message: 'Connecting to database...',
    error: null
  });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let intervalId;
    
    const checkStatus = async () => {
      try {
        const response = await axios.get('/api/db-status');
        setStatus(response.data);
        
        // Hide component 5 seconds after completion
        if (response.data.isComplete) {
          setTimeout(() => {
            setVisible(false);
          }, 5000);
          
          // Stop polling once complete
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error fetching database status:', error);
        setStatus(prev => ({
          ...prev,
          error: error.message || 'Failed to fetch database status'
        }));
      }
    };
    
    // Initial check
    checkStatus();
    
    // Poll every 2 seconds
    intervalId = setInterval(checkStatus, 2000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Don't render if not visible or already complete and we've waited
  if (!visible) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-50">
      <div className="container mx-auto">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-lg">
              {status.isComplete ? 'Database Ready!' : 'Initializing Database...'}
            </div>
            {status.isComplete && (
              <button 
                onClick={() => setVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            {status.message}
          </div>
          
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div 
                style={{ width: `${status.progress}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  status.isComplete ? 'bg-green-500' : 'bg-indigo-500'
                } transition-all duration-500 ease-in-out`}
              ></div>
            </div>
          </div>
          
          {status.error && (
            <div className="text-red-500 text-sm mt-1">
              Error: {status.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseInitStatus; 
