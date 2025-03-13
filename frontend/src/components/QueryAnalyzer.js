import React, { useState } from 'react';
import axios from 'axios';

const QueryAnalyzer = () => {
  const [query, setQuery] = useState('');
  const [queryPlan, setQueryPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyzeQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/query/explain`, { query });
      setQueryPlan(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Query Analyzer</h2>
      <div className="form-group">
        <label htmlFor="query">SQL Query:</label>
        <textarea
          id="query"
          className="query-input"
          rows="6"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your SQL query here..."
        />
      </div>
      <button 
        className="btn"
        onClick={handleAnalyzeQuery}
        disabled={!query.trim() || loading}
      >
        {loading ? 'Analyzing...' : 'Analyze Query'}
      </button>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {queryPlan && (
        <div className="query-plan">
          <h3>Execution Plan</h3>
          <pre>{JSON.stringify(queryPlan, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default QueryAnalyzer; 