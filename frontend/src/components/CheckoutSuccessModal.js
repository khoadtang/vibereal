import React, { useEffect, useState } from 'react';

/**
 * Animated checkout success modal component
 */
const CheckoutSuccessModal = ({ orderId, total, onClose, isOpen }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [confettiElements, setConfettiElements] = useState([]);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Generate random confetti elements
      const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        color: ['#FCD34D', '#34D399', '#60A5FA', '#F472B6', '#A78BFA'][Math.floor(Math.random() * 5)],
        size: Math.random() * 10 + 5,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: Math.random() * 2 + 1
      }));
      
      setConfettiElements(newConfetti);
      
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 500);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, onClose]);
  
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    }
  };
  
  if (!isOpen && !isVisible) return null;
  
  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-full max-w-md transform transition-all duration-500 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'
        }`}
      >
        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiElements.map(confetti => (
            <div
              key={confetti.id}
              className="absolute rounded-full"
              style={{
                width: `${confetti.size}px`,
                height: `${confetti.size}px`,
                backgroundColor: confetti.color,
                left: `${confetti.left}%`,
                top: '-20px',
                opacity: 0.8,
                animation: `confetti-fall ${confetti.duration}s ease-in forwards`,
                animationDelay: `${confetti.delay}s`
              }}
            />
          ))}
        </div>
        
        {/* Modal content */}
        <div className="p-6">
          {/* Success icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" className="checkmark"></path>
            </svg>
          </div>
          
          {/* Content */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Confirmed!</h3>
            
            <div className="text-gray-500 dark:text-gray-300 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <p className="mb-2">Thank you for your purchase!</p>
              <p className="text-sm">We're preparing your order and will notify you when it ships.</p>
            </div>
            
            <div className="flex flex-col space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Order ID:</span>
                <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">${parseFloat(total).toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => {
                  if (onClose) onClose();
                }, 500);
              }}
            >
              View My Order
            </button>
            
            <div className="mt-4">
              <button 
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => {
                    if (onClose) onClose();
                  }, 500);
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessModal; 