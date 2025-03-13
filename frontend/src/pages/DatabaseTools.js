import React, { useState } from 'react';
import axios from 'axios';
import QueryAnalyzer from '../components/QueryAnalyzer';

const DatabaseTools = () => {
  const [activeTab, setActiveTab] = useState('query');
  const [sqlQuery, setSqlQuery] = useState('');
  const [indexDefinition, setIndexDefinition] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [indexResult, setIndexResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExecuteQuery = async () => {
    setLoading(true);
    setError(null);
    setQueryResults(null);
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/query/execute`, { query: sqlQuery });
      setQueryResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIndex = async () => {
    setLoading(true);
    setError(null);
    setIndexResult(null);
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/index/create`, { indexDefinition });
      setIndexResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create index');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Database Tools</h1>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'query' ? 'active' : ''}`}
          onClick={() => setActiveTab('query')}
        >
          Query Executor
        </button>
        <button 
          className={`tab ${activeTab === 'explain' ? 'active' : ''}`}
          onClick={() => setActiveTab('explain')}
        >
          Query Analyzer
        </button>
        <button 
          className={`tab ${activeTab === 'index' ? 'active' : ''}`}
          onClick={() => setActiveTab('index')}
        >
          Index Manager
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'query' && (
          <div className="card">
            <h2>SQL Query Executor</h2>
            <div className="form-group">
              <label htmlFor="sql-query">SQL Query:</label>
              <textarea
                id="sql-query"
                className="query-input"
                rows="6"
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="Enter your SQL query here..."
              />
            </div>
            <button 
              className="btn"
              onClick={handleExecuteQuery}
              disabled={!sqlQuery.trim() || loading}
            >
              {loading ? 'Executing...' : 'Execute Query'}
            </button>
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            {queryResults && (
              <div className="query-results">
                <h3>Results</h3>
                {queryResults.rowCount > 0 ? (
                  <table className="results-table">
                    <thead>
                      <tr>
                        {queryResults.fields.map((field, index) => (
                          <th key={index}>{field.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResults.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((value, colIndex) => (
                            <td key={colIndex}>{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Query executed successfully. No results to display.</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'explain' && (
          <QueryAnalyzer />
        )}
        
        {activeTab === 'index' && (
          <div className="card">
            <h2>Index Manager</h2>
            <div className="form-group">
              <label htmlFor="index-definition">Index Definition:</label>
              <textarea
                id="index-definition"
                className="query-input"
                rows="4"
                value={indexDefinition}
                onChange={(e) => setIndexDefinition(e.target.value)}
                placeholder="CREATE INDEX idx_name ON table_name (column_name);"
              />
            </div>
            <button 
              className="btn"
              onClick={handleCreateIndex}
              disabled={!indexDefinition.trim() || loading}
            >
              {loading ? 'Creating...' : 'Create Index'}
            </button>
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            {indexResult && (
              <div className="success-message">
                <p>Index created successfully!</p>
                <p>Creation time: {indexResult.creationTime}ms</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseTools; 