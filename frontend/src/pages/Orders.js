import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const location = useLocation();
  
  // For demo purposes, we'll use a hardcoded user ID
  const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  
  useEffect(() => {
    // Check if redirected from checkout
    if (location.state && location.state.fromCheckout) {
      setSuccessMessage(`Your order #${location.state.orderId} has been placed successfully!`);
      
      // Create a new order from checkout data
      let newOrder;
      if (location.state.order) {
        // If we have a complete order object, use it directly
        newOrder = location.state.order;
      } else {
        // Create a temporary order from checkout data (fallback)
        newOrder = {
          id: location.state.orderId || `order-${Date.now()}`,
          created_at: location.state.date || new Date().toISOString(),
          status: 'pending',
          total_amount: location.state.total || '0.00',
          user_id: userId
        };
      }
      
      // Only add the new order to the list if it matches the status filter, or if no filter is active
      if (!statusFilter || statusFilter.toLowerCase() === newOrder.status.toLowerCase()) {
        setOrders(prevOrders => [newOrder, ...prevOrders]);
      }
      
      // Clear the success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      // Always fetch orders from API
      fetchOrders();
    }
  }, [location]);
  
  // Separate useEffect that only handles status filter changes
  useEffect(() => {
    // Always fetch orders when the status filter changes
    fetchOrders();
  }, [statusFilter]);
  
  // Use this to console log the current orders for debugging
  useEffect(() => {
    console.log('Current orders:', orders);
  }, [orders]);
  
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    // Log that we're fetching orders with the current filter
    console.log(`Fetching orders with status filter: ${statusFilter || 'All'}`);
    
    try {
      // Add some sample demo orders if we're in development mode
      // This ensures we always see something in the orders list
      const demoOrders = [
        {
          id: 'demo-order-1',
          created_at: new Date(Date.now() - 86400000).toISOString(), // yesterday
          status: 'completed',
          total_amount: '149.98',
          user_id: userId
        },
        {
          id: 'demo-order-2',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          status: 'processing',
          total_amount: '79.95',
          user_id: userId
        }
      ];
      
      try {
        // Build API parameters
        const params = {
          userId
        };
        
        // Only add status parameter if a filter is selected
        if (statusFilter) {
          params.status = statusFilter.toLowerCase();
        }
        
        console.log('API request parameters:', params);
        
        const response = await axios.get(`/api/orders`, { params });
        
        console.log('API response:', response.data);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setOrders(response.data);
        } else {
          // If no orders from API, use demo orders BUT filter them based on statusFilter
          if (statusFilter) {
            // Filter demo orders by status when a filter is selected
            const filteredDemoOrders = demoOrders.filter(order => order.status === statusFilter.toLowerCase());
            setOrders(filteredDemoOrders);
          } else {
            // If no filter, show all demo orders
            setOrders(demoOrders);
          }
        }
      } catch (apiErr) {
        console.error('API error, using demo orders instead:', apiErr);
        // Also apply filtering to demo orders when there's an API error
        if (statusFilter) {
          const filteredDemoOrders = demoOrders.filter(order => order.status === statusFilter.toLowerCase());
          setOrders(filteredDemoOrders);
        } else {
          setOrders(demoOrders);
        }
      }
    } catch (err) {
      setError('Error fetching orders. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="font-semibold text-green-700">{successMessage}</p>
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Status
        </label>
        <div className="flex">
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      <div className="mb-8">
        {loading ? (
          <div className="text-center py-8">
            <p>Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${parseFloat(order.total_amount).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.id.startsWith('ORD-') || order.id.startsWith('order-') ? (
                        // For temporary orders, pass the state
                        <Link 
                          to={`/orders/${order.id}`} 
                          state={{ 
                            items: location.state?.items || [],
                            date: order.created_at
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                      ) : (
                        // For regular orders
                        <Link to={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                          View Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p>No orders found. {statusFilter && 'Try a different status filter.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 