import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Modal displayed when a product is added to cart
 */
const AddToCartModal = ({ product, isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Start animate-in after a tiny delay to ensure transition works
      setTimeout(() => setAnimateIn(true), 10);
      
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        setAnimateIn(false);
        // Wait for animation to complete before fully closing
        setTimeout(() => {
          setIsVisible(false);
          if (onClose) onClose();
        }, 300);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [isOpen, onClose]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`fixed bottom-5 right-5 z-50 transform transition-transform duration-300 ease-out ${
      animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-md border border-green-100 dark:border-green-900">
        <div className="relative">
          {/* Top colored bar with success message */}
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 py-3 px-4">
            <div className="flex items-center">
              <div className="mr-3 bg-white bg-opacity-20 rounded-full p-1">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-white font-semibold">Added to Cart</p>
              <button 
                className="ml-auto text-white opacity-70 hover:opacity-100 focus:outline-none"
                onClick={() => {
                  setAnimateIn(false);
                  setTimeout(() => {
                    setIsVisible(false);
                    if (onClose) onClose();
                  }, 300);
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Product details */}
          <div className="p-4">
            <div className="flex">
              {/* Product image */}
              <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%236b7280'%3E${product.name.charAt(0)}%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-lg font-bold">
                    {product.name.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* Product info */}
              <div className="ml-4 flex-1">
                <h3 className="text-gray-800 dark:text-gray-200 font-medium">{product.name}</h3>
                <p className="text-green-600 dark:text-green-400 font-bold mt-1">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Quantity: 1
                </p>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="mt-4 flex space-x-3">
              <Link
                to="/cart"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors"
                onClick={() => {
                  setAnimateIn(false);
                  setTimeout(() => {
                    setIsVisible(false);
                    if (onClose) onClose();
                  }, 300);
                }}
              >
                View Cart
              </Link>
              <button
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-center py-2 px-4 rounded-md text-sm font-medium transition-colors"
                onClick={() => {
                  setAnimateIn(false);
                  setTimeout(() => {
                    setIsVisible(false);
                    if (onClose) onClose();
                  }, 300);
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

export default AddToCartModal; 