import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchExecutionTime, setSearchExecutionTime] = useState(null);
  
  // Load initial users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      const startTime = performance.now();
      
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
        setUsers(response.data.data);
        
        const endTime = performance.now();
        setExecutionTime(endTime - startTime);
      } catch (err) {
        setError('Error loading users: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Search for user by email
  const handleEmailSearch = async (e) => {
    e.preventDefault();
    
    if (!searchEmail.trim()) return;
    
    setDetailsLoading(true);
    setUserDetails(null);
    setSearchExecutionTime(null);
    
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/search?email=${encodeURIComponent(searchEmail)}`);
      setUserDetails(response.data);
      
      const endTime = performance.now();
      setSearchExecutionTime(endTime - startTime);
    } catch (err) {
      setError('Error searching for user: ' + (err.response?.data?.message || err.message));
    } finally {
      setDetailsLoading(false);
    }
  };

  // Load user details
  const loadUserDetails = async (userId) => {
    setDetailsLoading(true);
    setUserDetails(null);
    setSearchExecutionTime(null);
    
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/${userId}`);
      setUserDetails(response.data);
      
      const endTime = performance.now();
      setSearchExecutionTime(endTime - startTime);
    } catch (err) {
      setError('Error loading user details: ' + (err.response?.data?.message || err.message));
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>User Management</h1>
      
      <div className="card">
        <h2>Search User by Email</h2>
        <p className="description">
          This demonstrates slow user lookup by email due to missing indexes.
          Try searching for a user to see the performance impact.
        </p>
        
        <form onSubmit={handleEmailSearch} className="search-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter user email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn" disabled={detailsLoading || !searchEmail.trim()}>
              {detailsLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        
        {searchExecutionTime && (
          <div className="execution-time">
            Search completed in: <strong>{searchExecutionTime.toFixed(2)}ms</strong> (client-side time)
          </div>
        )}
      </div>
      
      <div className="row">
        <div className="column">
          <div className="card">
            <h2>Users</h2>
            
            {loading ? (
              <div className="loading">Loading users...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                {executionTime && (
                  <div className="execution-time">
                    Users loaded in: <strong>{executionTime.toFixed(2)}ms</strong> (client-side time)
                  </div>
                )}
                
                <div className="users-list">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Location</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{`${user.first_name} ${user.last_name}`}</td>
                          <td>{user.email}</td>
                          <td>{`${user.city}, ${user.country}`}</td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn-small"
                              onClick={() => loadUserDetails(user.id)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="column">
          {userDetails ? (
            <div className="card user-details">
              <h2>User Details</h2>
              
              <div className="user-profile">
                <div className="user-profile-header">
                  <div className="user-avatar">
                    {userDetails.first_name && userDetails.first_name.charAt(0)}
                    {userDetails.last_name && userDetails.last_name.charAt(0)}
                  </div>
                  <div className="user-name">
                    <h3>{`${userDetails.first_name} ${userDetails.last_name}`}</h3>
                    <p className="user-email">{userDetails.email}</p>
                  </div>
                </div>
                
                <div className="user-info">
                  <div className="info-section">
                    <h4>Contact Information</h4>
                    <p><strong>Phone:</strong> {userDetails.phone || 'Not provided'}</p>
                    <p><strong>Address:</strong> {userDetails.address}</p>
                    <p><strong>City:</strong> {userDetails.city}</p>
                    <p><strong>Country:</strong> {userDetails.country}</p>
                    <p><strong>Postal Code:</strong> {userDetails.postal_code}</p>
                  </div>
                  
                  <div className="info-section">
                    <h4>Account Information</h4>
                    <p><strong>Username:</strong> {userDetails.username}</p>
                    <p><strong>Created:</strong> {new Date(userDetails.created_at).toLocaleString()}</p>
                    <p><strong>Last Login:</strong> {userDetails.last_login ? new Date(userDetails.last_login).toLocaleString() : 'Never'}</p>
                  </div>
                  
                  <div className="info-section">
                    <h4>Order History</h4>
                    <p><strong>Total Orders:</strong> {userDetails.order_count || 0}</p>
                    <p><strong>Total Items:</strong> {userDetails.order_items_count || 0}</p>
                    <p><strong>Total Spent:</strong> ${parseFloat(userDetails.total_spent || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <h2>User Details</h2>
              <p className="empty-message">
                Select a user or search by email to view details
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="card">
        <h2>Performance Issue</h2>
        <p>
          User management operations are slow because of inefficient database queries:
        </p>
        
        <h3>1. Searching for user by email:</h3>
        <pre className="code">
{`SELECT id, username, email, first_name, last_name 
FROM users
WHERE email = '${searchEmail || 'user@example.com'}'`}
        </pre>
        
        <h3>2. Retrieving user details:</h3>
        <pre className="code">
{`SELECT u.*, 
       COUNT(DISTINCT o.id) as order_count,
       COUNT(DISTINCT oi.id) as order_items_count,
       SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE u.id = [user_id]
GROUP BY u.id`}
        </pre>
        
        <h3>How to Fix:</h3>
        <ol>
          <li>Add an index on the email field:
            <pre className="code">
              CREATE INDEX idx_users_email ON users(email);
            </pre>
          </li>
          <li>
            Add a unique constraint on email for better performance:
            <pre className="code">
              ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
            </pre>
          </li>
          <li>
            Improve the user details query:
            <pre className="code">
              -- Add indexes for joins
              CREATE INDEX idx_orders_user_id ON orders(user_id);
              
              -- Possibly create a materialized view for user stats
              CREATE MATERIALIZED VIEW user_order_stats AS
              SELECT u.id as user_id,
                     COUNT(DISTINCT o.id) as order_count,
                     COUNT(DISTINCT oi.id) as order_items_count,
                     SUM(o.total_amount) as total_spent
              FROM users u
              LEFT JOIN orders o ON u.id = o.user_id
              LEFT JOIN order_items oi ON o.id = oi.order_id
              GROUP BY u.id;
            </pre>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default UserManagement; 