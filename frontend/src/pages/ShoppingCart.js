import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SQLCodeBlock from '../components/SQLCodeBlock';
import { useToast } from '../components/ToastProvider';
import CheckoutSuccessModal from '../components/CheckoutSuccessModal';

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({ orderId: '', total: 0 });
  const navigate = useNavigate();
  const componentMounted = useRef(true);
  const { checkout } = useToast();
  
  // For demo purposes, we'll use a hardcoded user ID
  const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  
  // Helper function to get product image based on product ID - NEVER use placeholder.com
  const getProductImage = (productId) => {
    // Create a deterministic seed from the product ID for consistency
    const hash = String(productId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Use a specific fixed photo ID from Lorem Picsum to avoid random failures
    const photoId = (hash % 30) + 10; // Use a limited range (10-40) of known good picsum photos
    // Direct CDN URL for more reliable loading
    return `https://picsum.photos/id/${photoId}/400/400`;
  };
  
  // Fallback image in case the primary image fails to load - NEVER use placeholder.com
  const getBackupImage = (productId) => {
    // Create a simple colored SVG directly inline - no external requests
    const hash = String(productId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#4299E1', '#48BB78', '#ED8936', '#9F7AEA', '#F56565'];
    const bgColor = colors[hash % colors.length];
    
    // Simplified SVG with just the essentials
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="${bgColor}" />
      <text x="200" y="200" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">Product ${String(productId).slice(0, 6)}</text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };
  
  // Fix any placeholder images that might still be in the DOM
  useEffect(() => {
    const fixPlaceholderImages = () => {
      if (!componentMounted.current) return;
      document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && (src.includes('placeholder.com') || src.includes('300x300') || src.includes('?text='))) {
          console.log('🧹 Fixing placeholder image in cart:', src);
          const itemId = img.getAttribute('data-product-id') || Math.floor(Math.random() * 1000);
          img.src = getBackupImage(itemId);
        }
      });
    };

    // Fix images immediately and periodically
    fixPlaceholderImages();
    const interval = setInterval(fixPlaceholderImages, 1000);
    
    // Clean up
    return () => {
      componentMounted.current = false;
      clearInterval(interval);
    };
  }, []);
  
  useEffect(() => {
    fetchCartItems();
  }, []);
  
  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      // Use the Nginx proxy path instead of direct API URL
      const response = await axios.get(`/api/cart/${userId}`);
      console.log('Cart API Response:', response.data);
      
      // Check if the response has the expected structure
      if (response.data && response.data.items) {
        setCartItems(response.data.items);
      } else if (Array.isArray(response.data)) {
        // Handle case where API might return an array directly
        setCartItems(response.data);
      } else {
        console.error('Unexpected cart data format:', response.data);
        setCartItems([]);
        setError('Received unexpected cart data format from API');
      }
      
      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError(`Error fetching cart items: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      console.log(`Updating quantity for product ${productId} to ${newQuantity}`);
      
      // Call the backend API to update quantity
      const response = await axios.put(`/api/cart/${userId}/${productId}`, {
        quantity: newQuantity
      });
      
      console.log('Quantity update response:', response.data);
      
      // Update local state after successful API call
      setCartItems(prevItems => 
        prevItems.map(item => {
          const itemId = item.product_id || item.id;
          const price = typeof item.price === 'string' ? parseFloat(item.price) : 
                      (typeof item.price === 'number' ? item.price : 0);
          
          if (itemId === productId) {
            return { 
              ...item, 
              quantity: newQuantity, 
              subtotal: price * newQuantity 
            };
          } else {
            return item;
          }
        })
      );
    } catch (err) {
      console.error(`Error updating quantity for product ${productId}:`, err);
      setError(`Failed to update quantity: ${err.message}`);
      
      // Refresh cart to ensure UI matches database state
      fetchCartItems();
    }
  };
  
  const removeItem = async (productId) => {
    try {
      console.log(`Removing product ${productId} from cart`);
      
      // Call the backend API to remove the item
      const response = await axios.delete(`/api/cart/${userId}/${productId}`);
      
      console.log('Item removal response:', response.data);
      
      // Update local state after successful API call
      setCartItems(prevItems => 
        prevItems.filter(item => {
          const itemId = item.product_id || item.id;
          return itemId !== productId;
        })
      );
      
      // Dispatch event to update cart badge in header
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error(`Error removing product ${productId} from cart:`, err);
      setError(`Failed to remove item: ${err.message}`);
      
      // Refresh cart to ensure UI matches database state
      fetchCartItems();
    }
  };
  
  const calculateTotal = () => {
    if (!cartItems || cartItems.length === 0) {
      return '0.00';
    }
    
    // Calculate the raw total first
    const rawTotal = cartItems.reduce((total, item) => {
      // Calculate item subtotal (price * quantity)
      const price = typeof item.price === 'string' ? parseFloat(item.price) : 
                  (typeof item.price === 'number' ? item.price : 0);
      
      const quantity = item.quantity || 1;
      const subtotal = item.subtotal ? 
                       (typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal) : 
                       (price * quantity);
      
      return total + subtotal;
    }, 0);
    
    // Format the total with two decimal places and return as string
    return rawTotal.toFixed(2);
  };
  
  // Example slow query for demonstration
  const slowQuery = `
SELECT p.id, p.name, p.price, ci.quantity, (p.price * ci.quantity) as subtotal
FROM ecommerce.shopping_cart sc
JOIN ecommerce.cart_items ci ON sc.id = ci.cart_id
JOIN ecommerce.products p ON ci.product_id = p.id
WHERE sc.user_id = '${userId}';
  `;
  
  // Example optimized query for demonstration
  const optimizedQuery = `
-- Add missing foreign key constraint
ALTER TABLE ecommerce.cart_items 
ADD CONSTRAINT fk_cart_items_product_id 
FOREIGN KEY (product_id) REFERENCES ecommerce.products(id);

-- Create indexes for the joins
CREATE INDEX idx_cart_items_cart_id ON ecommerce.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON ecommerce.cart_items(product_id);
CREATE INDEX idx_shopping_cart_user_id ON ecommerce.shopping_cart(user_id);

-- The query remains the same, but now uses indexes
SELECT p.id, p.name, p.price, ci.quantity, (p.price * ci.quantity) as subtotal
FROM ecommerce.shopping_cart sc
JOIN ecommerce.cart_items ci ON sc.id = ci.cart_id
JOIN ecommerce.products p ON ci.product_id = p.id
WHERE sc.user_id = '${userId}';
  `;

  const proceedToCheckout = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty. Add some items before checking out.');
      return;
    }
    
    setIsCheckingOut(true);
    setError(null);
    
    try {
      // Simulate checkout process
      console.log('Processing checkout for items:', cartItems);
      
      // Generate a unique order ID
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const orderTotal = calculateTotal();
      const orderDate = new Date().toISOString();
      
      // Create order object
      const order = {
        id: orderId,
        created_at: orderDate,
        status: 'pending',
        total_amount: orderTotal,
        user_id: userId,
        items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };
      
      // You could make an API call here to create an order
      // const response = await axios.post('/api/orders', {
      //   user_id: userId,
      //   items: cartItems,
      //   total: orderTotal
      // });
      
      // For demo, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear the cart in the database
      try {
        console.log('Clearing cart in the database...');
        const clearCartResponse = await axios.delete(`/api/cart/${userId}`);
        console.log('Cart cleared successfully:', clearCartResponse.data);
      } catch (clearError) {
        console.error('Error clearing cart in database:', clearError);
        // Continue with checkout even if cart clearing fails
      }
      
      // Clear the cart in local state
      setCartItems([]);
      
      // Dispatch event to update cart badge in header
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success toast notification
      checkout(orderId, orderTotal);
      
      // Show success modal
      setCheckoutDetails({
        orderId,
        total: orderTotal
      });
      setShowSuccessModal(true);
      
      // Redirect to orders page with complete order details after modal is closed
      setTimeout(() => {
        navigate('/orders', { 
          state: { 
            fromCheckout: true,
            orderId: orderId,
            total: orderTotal,
            items: order.items,
            date: orderDate,
            order: order // Pass the complete order object
          }
        });
      }, 6000); // Give time for modal to be shown
    } catch (err) {
      console.error('Error during checkout:', err);
      setError(`Checkout failed: ${err.message}. Please try again.`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-indigo-800 text-center">
          Your Shopping Cart
        </h1>
        
        {/* Performance Challenge Section removed */}
        
        {executionTime && (
          <div className={`mb-6 p-4 rounded-xl shadow-md ${parseFloat(executionTime) > 40 ? 'bg-red-50 border border-red-300' : 'bg-green-50 border border-green-300'} flex items-center justify-between`}>
            <div>
              <p className="font-semibold flex items-center">
                {parseFloat(executionTime) > 40 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                Query execution time: <span className={`ml-1 font-bold ${parseFloat(executionTime) > 40 ? 'text-red-700' : 'text-green-700'}`}>{executionTime} ms</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Note: This includes network latency and API processing time.
              </p>
            </div>
            
            {parseFloat(executionTime) > 40 && (
              <div className="flex items-center text-red-700 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Query needs optimization!</span>
              </div>
            )}
            
            {parseFloat(executionTime) <= 40 && (
              <div className="text-green-700">
                <span className="font-medium">Query performance is good</span>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-md text-red-700 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <div className="mb-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-indigo-600 text-lg">Loading your cart...</p>
            </div>
          ) : cartItems.length > 0 ? (
            <div className="space-y-8">
              {/* Cart items */}
              <div className="grid grid-cols-1 gap-6">
                {cartItems.map(item => {
                  // Get the ID from either product_id or id field
                  const itemId = item.product_id || item.id;
                  
                  // Calculate display values with proper fallbacks
                  const itemName = item.name || `Product ${itemId}`;
                  const itemPrice = typeof item.price === 'number' ? 
                    item.price.toFixed(2) : 
                    (typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : '0.00');
                  
                  const itemQuantity = item.quantity || 1;
                  
                  // Calculate subtotal
                  const subtotal = item.subtotal ? 
                    (typeof item.subtotal === 'number' ? item.subtotal.toFixed(2) : parseFloat(item.subtotal).toFixed(2)) : 
                    (parseFloat(itemPrice) * itemQuantity).toFixed(2);
                  
                  // Get description or use a placeholder
                  const description = item.description || `High-quality ${itemName.toLowerCase()} with premium features and excellent durability.`;
                  
                  return (
                    <div key={itemId} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:shadow-lg border border-gray-100">
                      <div className="md:flex">
                        <div className="md:flex-shrink-0 bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center h-60 md:w-60 relative">
                          <img 
                            src={getProductImage(itemId)} 
                            alt={itemName}
                            data-product-id={itemId}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.log(`Image load failed for ${itemId}, using backup SVG`);
                              e.target.onerror = null; // Prevent infinite error loop
                              e.target.src = getBackupImage(itemId);
                            }}
                          />
                          <div className="absolute top-0 left-0 m-2 bg-white bg-opacity-90 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-800">
                            ID: {String(itemId).substring(0, 8)}...
                          </div>
                        </div>
                        <div className="p-6 flex flex-col justify-between flex-grow">
                          <div>
                            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                              {itemName.includes("Product") ? "Premium Product" : "Exclusive Item"}
                            </div>
                            <a href="#" className="block mt-1 text-xl font-medium text-gray-800 hover:underline">{itemName}</a>
                            <p className="mt-2 text-gray-500 line-clamp-2">{description}</p>
                          </div>
                          
                          <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button 
                                  onClick={() => {
                                    setUpdatingItems(prev => ({ ...prev, [itemId]: 'quantity' }));
                                    updateQuantity(itemId, itemQuantity - 1).finally(() => {
                                      setUpdatingItems(prev => {
                                        const updated = { ...prev };
                                        delete updated[itemId];
                                        return updated;
                                      });
                                    });
                                  }}
                                  disabled={updatingItems[itemId]}
                                  className={`${updatingItems[itemId] ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'} px-4 py-2 transition-colors focus:outline-none`}
                                >
                                  {updatingItems[itemId] === 'quantity' ? '...' : '-'}
                                </button>
                                <span className="px-4 py-2 bg-white">{itemQuantity}</span>
                                <button 
                                  onClick={() => {
                                    setUpdatingItems(prev => ({ ...prev, [itemId]: 'quantity' }));
                                    updateQuantity(itemId, itemQuantity + 1).finally(() => {
                                      setUpdatingItems(prev => {
                                        const updated = { ...prev };
                                        delete updated[itemId];
                                        return updated;
                                      });
                                    });
                                  }}
                                  disabled={updatingItems[itemId]}
                                  className={`${updatingItems[itemId] ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'} px-4 py-2 transition-colors focus:outline-none`}
                                >
                                  {updatingItems[itemId] === 'quantity' ? '...' : '+'}
                                </button>
                              </div>
                              
                              <button 
                                onClick={() => {
                                  setUpdatingItems(prev => ({ ...prev, [itemId]: 'remove' }));
                                  removeItem(itemId).finally(() => {
                                    setUpdatingItems(prev => {
                                      const updated = { ...prev };
                                      delete updated[itemId];
                                      return updated;
                                    });
                                  });
                                }}
                                disabled={updatingItems[itemId]}
                                className={`text-red-600 hover:text-red-900 transition-colors flex items-center ${updatingItems[itemId] ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {updatingItems[itemId] === 'remove' ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Removing
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Remove
                                  </span>
                                )}
                              </button>
                            </div>
                            
                            <div className="flex flex-col items-end">
                              <div className="text-lg font-bold text-indigo-800">${subtotal}</div>
                              <div className="text-sm text-gray-500">${itemPrice} per unit</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Order summary */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-800">${calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-800">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes</span>
                      <span className="text-gray-800">Calculated at checkout</span>
                    </div>
                    <div className="border-t border-gray-200 my-4"></div>
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-lg font-bold text-indigo-700">${calculateTotal()}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={proceedToCheckout}
                    disabled={isCheckingOut || cartItems.length === 0}
                    className={`w-full mt-6 ${
                      isCheckingOut ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white rounded-lg px-6 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center`}
                  >
                    {isCheckingOut ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Proceed to Checkout
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
              <a href="/products" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Continue Shopping
              </a>
            </div>
          )}
        </div>
        
        {/* Hide these sections from regular users with a data-developer attribute */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8" data-developer="true" style={{ display: 'none' }}>
          <h2 className="text-xl font-bold mb-4">Slow Query</h2>
          <p className="mb-4">
            This is the current query being used, which has performance issues:
          </p>
          <SQLCodeBlock sql={slowQuery} />
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6" data-developer="true" style={{ display: 'none' }}>
          <h2 className="text-xl font-bold mb-4">Optimized Query</h2>
          <p className="mb-4">
            Here's how you can optimize the query:
          </p>
          <SQLCodeBlock sql={optimizedQuery} />
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Optimization Explanation:</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <strong>Add foreign key constraints:</strong> This ensures data integrity and can help the query planner.
              </li>
              <li>
                <strong>Create indexes on join columns:</strong> This dramatically improves JOIN performance.
              </li>
              <li>
                <strong>Create index on filter column:</strong> This improves the WHERE clause performance.
              </li>
            </ol>
          </div>
        </div>
      </div>
      
      {/* Checkout Success Modal */}
      <CheckoutSuccessModal
        isOpen={showSuccessModal}
        orderId={checkoutDetails.orderId}
        total={checkoutDetails.total}
        onClose={() => {
          setShowSuccessModal(false);
          // Redirect to orders page with complete order details
          navigate('/orders', { 
            state: { 
              fromCheckout: true,
              orderId: checkoutDetails.orderId,
              total: checkoutDetails.total,
              date: new Date().toISOString()
            }
          });
        }}
      />
    </div>
  );
};

export default ShoppingCart; 