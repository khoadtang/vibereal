import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';

// Create a context for the toast functionality
const ToastContext = createContext();

/**
 * Custom hook to use the toast functionality
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Toast provider component to manage toast notifications
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  // Add a new toast notification
  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now().toString();
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
    return id;
  }, []);
  
  // Remove a toast notification
  const hideToast = useCallback(id => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);
  
  // Convenience methods for different toast types
  const success = useCallback((message, duration) => {
    return showToast(message, 'success', duration);
  }, [showToast]);
  
  const error = useCallback((message, duration) => {
    return showToast(message, 'error', duration);
  }, [showToast]);
  
  const info = useCallback((message, duration) => {
    return showToast(message, 'info', duration);
  }, [showToast]);
  
  const warning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);
  
  // Create cool checkout notification with extras
  const checkout = useCallback((orderId, total, duration = 5000) => {
    const message = (
      <div>
        <div className="text-lg font-bold mb-1">Order Confirmed! 🎉</div>
        <div className="flex items-baseline">
          <span className="mr-1">Order</span>
          <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-sm">{orderId}</span>
          <span className="mx-1">placed for</span> 
          <span className="font-bold">${total}</span>
        </div>
        <div className="mt-1 text-xs opacity-80">Redirecting to your orders...</div>
      </div>
    );
    return showToast(message, 'success', duration);
  }, [showToast]);
  
  // Cool toast for adding to cart
  const addToCart = useCallback((productName, price, duration = 3000) => {
    const message = (
      <div>
        <div className="text-lg font-bold mb-1">Added to Cart!</div>
        <div className="flex items-baseline">
          <span>{productName}</span>
          {price && <span className="ml-1 font-bold">(${price})</span>}
        </div>
      </div>
    );
    return showToast(message, 'success', duration);
  }, [showToast]);
  
  return (
    <ToastContext.Provider value={{ showToast, hideToast, success, error, info, warning, checkout, addToCart }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export default ToastProvider; 