import React from 'react';

const SQLCodeBlock = ({ sql }) => {
  // Simple syntax highlighting for SQL
  const highlightSQL = (code) => {
    // Keywords
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 
      'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE', 
      'DELETE', 'CREATE', 'ALTER', 'DROP', 'INDEX', 'TABLE', 'VIEW', 'AS', 'ON', 
      'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL',
      'ASC', 'DESC', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      'UNION', 'ALL', 'WITH'
    ];
    
    // Functions
    const functions = [
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'CAST', 
      'TO_CHAR', 'TO_DATE', 'EXTRACT', 'NOW', 'CURRENT_DATE', 'CURRENT_TIMESTAMP',
      'EXPLAIN', 'ANALYZE', 'ARRAY_AGG', 'STRING_AGG', 'JSON_AGG', 'JSONB_AGG'
    ];
    
    let highlightedCode = code;
    
    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedCode = highlightedCode.replace(regex, match => 
        `<span class="sql-keyword">${match}</span>`
      );
    });
    
    // Highlight functions
    functions.forEach(func => {
      const regex = new RegExp(`\\b${func}\\b\\s*\\(`, 'gi');
      highlightedCode = highlightedCode.replace(regex, match => 
        match.replace(new RegExp(`\\b${func}\\b`, 'gi'), match => 
          `<span class="sql-function">${match}</span>`
        )
      );
    });
    
    // Highlight strings
    highlightedCode = highlightedCode.replace(/'([^']*)'/g, 
      `<span class="sql-string">'$1'</span>`
    );
    
    // Highlight numbers
    highlightedCode = highlightedCode.replace(/\b(\d+)\b/g, 
      `<span class="sql-number">$1</span>`
    );
    
    // Highlight comments
    highlightedCode = highlightedCode.replace(/--(.*)$/gm, 
      `<span class="sql-comment">--$1</span>`
    );
    
    return highlightedCode;
  };

  // Log the SQL for developers to view in console
  React.useEffect(() => {
    console.info('SQL Query:', sql);
  }, [sql]);

  return (
    <div>
      {/* Message for regular users */}
      <div className="code-block-placeholder p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-500 italic">
        Advanced technical information hidden. View page source or use browser inspection tools to see details.
      </div>
      
      {/* Hidden SQL code that's only visible in the DOM when inspecting */}
      <pre className="code-block" style={{ display: 'none' }}>
        <code dangerouslySetInnerHTML={{ __html: highlightSQL(sql) }} />
      </pre>
      
      {/* Add SQL as a HTML comment for developers */}
      {/* <!-- SQL Query: 
        ${sql}
      --> */}
    </div>
  );
};

export default SQLCodeBlock; 