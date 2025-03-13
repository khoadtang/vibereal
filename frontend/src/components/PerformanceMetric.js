import React from 'react';

const PerformanceMetric = ({ title, value, unit, description }) => {
  return (
    <div className="metric-card">
      <h3>{title}</h3>
      <div className="metric-value">
        {value} <span className="metric-unit">{unit}</span>
      </div>
      <p className="metric-description">{description}</p>
    </div>
  );
};

export default PerformanceMetric; 