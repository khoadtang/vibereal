import React, { useEffect, useState } from 'react';

/**
 * Toast notification component with animation effects
 * 
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {string} props.type - The type of toast (success, error, info, warning)
 * @param {number} props.duration - Duration in ms to show the toast
 * @param {function} props.onClose - Function to call when toast is closed
 * @param {boolean} props.show - Whether to show the toast
 */
const Toast = ({ message, type = 'success', duration = 3000, onClose, show = true }) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  
  useEffect(() => {
    if (show) {
      setVisible(true);
      
      const timer = setTimeout(() => {
        setClosing(true);
        
        // Allow time for close animation
        setTimeout(() => {
          setVisible(false);
          setClosing(false);
          if (onClose) onClose();
        }, 300);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);
  
  if (!visible) return null;
  
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'error':
        return {
          bgColor: 'bg-gradient-to-r from-red-500 to-rose-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case 'info':
        return {
          bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'warning':
        return {
          bgColor: 'bg-gradient-to-r from-yellow-400 to-amber-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      default:
        return {
          bgColor: 'bg-gradient-to-r from-gray-600 to-gray-700',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };
  
  const { bgColor, icon } = getTypeStyles();
  
  // Animated confetti effect for success toasts
  const renderConfetti = () => {
    if (type !== 'success') return null;
    
    return (
      <div className="confetti-container absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className={`confetti-particle absolute h-2 w-2 rounded-full ${
              i % 3 === 0 ? 'bg-yellow-300' : i % 3 === 1 ? 'bg-blue-300' : 'bg-pink-300'
            } opacity-80`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `confetti-fall ${0.5 + Math.random() * 2}s linear forwards`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div 
      className={`fixed top-4 right-4 z-50 transform transition-transform duration-300 ${
        closing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div 
        className={`${bgColor} backdrop-blur-md rounded-lg shadow-lg px-4 py-3 flex items-center max-w-md`}
        style={{ minWidth: '300px' }}
      >
        <div className="mr-3 p-1">
          {icon}
        </div>
        <div className="flex-1 text-white font-medium">
          {message}
        </div>
        <button 
          className="ml-2 text-white opacity-70 hover:opacity-100 focus:outline-none"
          onClick={() => {
            setClosing(true);
            setTimeout(() => {
              setVisible(false);
              setClosing(false);
              if (onClose) onClose();
            }, 300);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {renderConfetti()}
      </div>
      
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(40px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast; 