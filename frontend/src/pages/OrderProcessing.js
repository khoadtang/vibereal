import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderProcessing = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('processing');
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsExecutionTime, setDetailsExecutionTime] = useState(null);

  // Load orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      
      const startTime = performance.now();
      
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/orders`);
        setOrders(response.data.data);
        
        // Filter orders by selected status
        const filtered = response.data.data.filter(order => order.status === selectedStatus);
        setFilteredOrders(filtered);
        
        const endTime = performance.now();
        setExecutionTime(endTime - startTime);
      } catch (err) {
        setError('Error loading orders: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders when status changes
  useEffect(() => {
    const filtered = orders.filter(order => order.status === selectedStatus);
    setFilteredOrders(filtered);
  }, [selectedStatus, orders]);

  // Load order details
  const loadOrderDetails = async (orderId) => {
    setDetailsLoading(true);
    setOrderDetails(null);
    setDetailsExecutionTime(null);
    
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/orders/${orderId}`);
      setOrderDetails(response.data);
      
      const endTime = performance.now();
      setDetailsExecutionTime(endTime - startTime);
    } catch (err) {
      setError('Error loading order details: ' + (err.response?.data?.message || err.message));
    } finally {
      setDetailsLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/orders/${orderId}/status`, { status: newStatus });
      
      // Update the local order data
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      if (orderDetails && orderDetails.id === orderId) {
        setOrderDetails({ ...orderDetails, status: newStatus });
      }
    } catch (err) {
      setError('Error updating order status: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container">
      <h1>Order Processing</h1>
      
      <div className="card">
        <h2>Manage Orders</h2>
        <p className="description">
          This page demonstrates slow order processing due to inefficient database queries.
          Try filtering orders by status and viewing order details to see the performance impact.
        </p>
        
        <div className="order-filters">
          <label>Filter by Status:</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="status-select"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {executionTime && (
              <div className="execution-time">
                Orders loaded in: <strong>{executionTime.toFixed(2)}ms</strong> (client-side time)
              </div>
            )}
            
            <div className="orders-list">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-orders">No orders with status "{selectedStatus}"</td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.username || order.email}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>{order.items_count || '-'}</td>
                        <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge status-${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-small"
                            onClick={() => loadOrderDetails(order.id)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
        
        {orderDetails && (
          <div className="order-details-panel">
            <h3>Order #{orderDetails.id} Details</h3>
            
            {detailsExecutionTime && (
              <div className="execution-time">
                Details loaded in: <strong>{detailsExecutionTime.toFixed(2)}ms</strong> (client-side time)
              </div>
            )}
            
            <div className="order-info">
              <div className="order-info-row">
                <div className="order-info-column">
                  <h4>Customer Information</h4>
                  <p>Name: {orderDetails.first_name} {orderDetails.last_name}</p>
                  <p>Email: {orderDetails.email}</p>
                </div>
                
                <div className="order-info-column">
                  <h4>Order Information</h4>
                  <p>Date: {new Date(orderDetails.created_at).toLocaleString()}</p>
                  <p>Status: 
                    <select 
                      value={orderDetails.status} 
                      onChange={(e) => updateOrderStatus(orderDetails.id, e.target.value)}
                      className="status-select-small"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </p>
                  <p>Total: ${parseFloat(orderDetails.total_amount).toFixed(2)}</p>
                </div>
              </div>
              
              <h4>Order Items</h4>
              {detailsLoading ? (
                <div className="loading">Loading order items...</div>
              ) : (
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.items && orderDetails.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.product_name}</td>
                        <td>${parseFloat(item.product_price).toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>${parseFloat(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="card">
        <h2>Performance Issue</h2>
        <p>
          Order processing is slow because of inefficient database queries:
        </p>
        
        <h3>1. Retrieving orders with status filter:</h3>
        <pre className="code">
{`SELECT o.*, u.email, u.username,
       COUNT(oi.id) as items_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = '${selectedStatus}'
GROUP BY o.id, u.email, u.username
ORDER BY o.created_at DESC
LIMIT 20 OFFSET 0`}
        </pre>
        
        <h3>2. Retrieving order details:</h3>
        <pre className="code">
{`-- First query for order details
SELECT o.*, 
       u.email, u.username, u.first_name, u.last_name
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.id = [order_id]

-- Second query for order items
SELECT oi.*, p.image_url, p.sku
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = [order_id]`}
        </pre>
        
        <h3>How to Fix:</h3>
        <ol>
          <li>Add indexes for frequently filtered and joined fields:
            <pre className="code">
              CREATE INDEX idx_orders_status ON orders(status);
              CREATE INDEX idx_orders_user_id ON orders(user_id);
              CREATE INDEX idx_order_items_order_id ON order_items(order_id);
            </pre>
          </li>
          <li>
            Add proper foreign key constraints:
            <pre className="code">
              ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product 
              FOREIGN KEY (product_id) REFERENCES products(id);
            </pre>
          </li>
          <li>
            Consider a composite index for filtering and sorting:
            <pre className="code">
              CREATE INDEX idx_orders_status_created_at ON orders(status, created_at DESC);
            </pre>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default OrderProcessing; 