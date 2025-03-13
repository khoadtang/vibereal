import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import SQLCodeBlock from '../components/SQLCodeBlock';

const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [isTemporaryOrder, setIsTemporaryOrder] = useState(false);
  
  // Use the Nginx proxy path instead of direct API URL
  // const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  
  useEffect(() => {
    // Check if this is a temporary order (from checkout)
    const isTemp = id && (id.startsWith('ORD-') || id.startsWith('order-'));
    setIsTemporaryOrder(isTemp);
    
    if (isTemp) {
      handleTemporaryOrder();
    } else {
      fetchOrderDetails();
    }
  }, [id]);
  
  const handleTemporaryOrder = () => {
    setLoading(true);
    
    try {
      // For temporary orders, we create mock order details
      const mockOrderItems = [];
      
      // Use data from location state if available
      if (location.state && location.state.items) {
        location.state.items.forEach(item => {
          mockOrderItems.push({
            order_id: id,
            order_date: location.state.date || new Date().toISOString(),
            status: 'pending',
            username: 'Demo User',
            email: 'demo@example.com',
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: (parseFloat(item.price) * item.quantity).toFixed(2)
          });
        });
      } else {
        // If no items in state, create a placeholder order item
        mockOrderItems.push({
          order_id: id,
          order_date: new Date().toISOString(),
          status: 'pending',
          username: 'Demo User',
          email: 'demo@example.com',
          product_name: 'Sample Product',
          quantity: 1,
          unit_price: '0.00',
          subtotal: '0.00'
        });
      }
      
      setOrderDetails(mockOrderItems);
      setExecutionTime('0.00'); // No real execution time for mock data
    } catch (err) {
      setError('Error displaying order details. Please try again.');
      console.error('Error handling temporary order:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`/api/orders/${id}`);
      setOrderDetails(response.data);
      
      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));
    } catch (err) {
      setError('Error fetching order details. Please try again.');
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate order total
  const calculateTotal = () => {
    return orderDetails.reduce((total, item) => total + parseFloat(item.subtotal), 0).toFixed(2);
  };
  
  // Example slow query for demonstration
  const slowQuery = `
SELECT * FROM ecommerce.vw_order_details
WHERE order_id = '${id}';
  `;
  
  // Example optimized query for demonstration
  const optimizedQuery = `
-- Add missing foreign key constraints
ALTER TABLE ecommerce.order_items 
ADD CONSTRAINT fk_order_items_order_id 
FOREIGN KEY (order_id) REFERENCES ecommerce.orders(id);

ALTER TABLE ecommerce.order_items 
ADD CONSTRAINT fk_order_items_product_id 
FOREIGN KEY (product_id) REFERENCES ecommerce.products(id);

-- Create indexes for the joins
CREATE INDEX idx_order_items_order_id ON ecommerce.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON ecommerce.order_items(product_id);

-- Create a materialized view for better performance
CREATE MATERIALIZED VIEW ecommerce.mv_order_details AS
SELECT 
    o.id AS order_id,
    o.created_at AS order_date,
    o.status,
    u.username,
    u.email,
    p.name AS product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS subtotal
FROM ecommerce.orders o
JOIN ecommerce.users u ON o.user_id = u.id
JOIN ecommerce.order_items oi ON o.id = oi.order_id
JOIN ecommerce.products p ON oi.product_id = p.id;

-- Create an index on the materialized view
CREATE UNIQUE INDEX idx_mv_order_details_order_id ON ecommerce.mv_order_details(order_id, product_name);

-- Query the materialized view instead
SELECT * FROM ecommerce.mv_order_details
WHERE order_id = '${id}';
  `;

  return (
    <div>
      <div className="mb-6">
        <Link to="/orders" className="text-blue-600 hover:text-blue-800 flex items-center">
          ← Back to Orders
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>
      
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Performance Challenge</h2>
        <p className="mb-4">
          This page demonstrates a common performance issue with order detail queries in PostgreSQL. 
          The current query uses an inefficient view that joins multiple tables without proper indexes.
        </p>
        <p>
          Notice the execution time when loading the order details. Then optimize the query with a materialized view and proper indexes.
        </p>
      </div>
      
      {executionTime && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="font-semibold">Query execution time: <span className="text-yellow-700">{executionTime} ms</span></p>
          <p className="text-sm text-gray-600">
            Note: This includes network latency and API processing time. The actual database query time would be lower.
          </p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      <div className="mb-8">
        {loading ? (
          <div className="text-center py-8">
            <p>Loading order details...</p>
          </div>
        ) : orderDetails.length > 0 ? (
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">{orderDetails[0]?.order_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{formatDate(orderDetails[0]?.order_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{orderDetails[0]?.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{orderDetails[0]?.username} ({orderDetails[0]?.email})</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Order Items</h2>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderDetails.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${parseFloat(item.unit_price).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${parseFloat(item.subtotal).toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right font-bold">
                      Total:
                    </td>
                    <td className="px-6 py-4 font-bold">
                      ${calculateTotal()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p>Order not found or has no items.</p>
          </div>
        )}
      </div>
      
      {/* Hide these sections from regular users with a data-developer attribute */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8" data-developer="true" style={{ display: 'none' }}>
        <h2 className="text-xl font-bold mb-4">Slow Query</h2>
        <p className="mb-4">
          This is the current query being used, which has performance issues:
        </p>
        <SQLCodeBlock sql={slowQuery} />
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6" data-developer="true" style={{ display: 'none' }}>
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
              <strong>Use a materialized view:</strong> For complex queries that are run frequently but don't need real-time data.
            </li>
            <li>
              <strong>Create an index on the materialized view:</strong> This makes filtering by order_id very fast.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 