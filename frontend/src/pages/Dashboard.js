import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PerformanceMetric from '../components/PerformanceMetric';
import ChallengeCard from '../components/ChallengeCard';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    avgQueryTime: 0,
    databaseSize: 0,
    activeConnections: 0,
    indexUsage: 0
  });
  
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch metrics and challenges data
        const [metricsResponse, challengesResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/metrics`),
          axios.get(`${process.env.REACT_APP_API_URL}/challenges`)
        ]);
        
        setMetrics(metricsResponse.data);
        setChallenges(challengesResponse.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock data for now
  const mockChallenges = [
    {
      id: 'product-search',
      title: 'Product Search Optimization',
      description: 'Optimize product search queries to reduce response time',
      difficulty: 2,
      status: 'incomplete',
      path: '/challenge/product-search'
    },
    {
      id: 'shopping-cart',
      title: 'Shopping Cart Performance',
      description: 'Improve the performance of shopping cart operations',
      difficulty: 3,
      status: 'incomplete',
      path: '/challenge/shopping-cart'
    },
    {
      id: 'order-processing',
      title: 'Order Processing Bottleneck',
      description: 'Resolve bottlenecks in the order processing flow',
      difficulty: 4,
      status: 'incomplete',
      path: '/challenge/order-processing'
    },
    {
      id: 'user-management',
      title: 'User Account Management',
      description: 'Optimize user account lookup and authentication',
      difficulty: 2,
      status: 'incomplete',
      path: '/challenge/user-management'
    }
  ];

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div>
      <h1>Performance Dashboard</h1>
      
      <section>
        <h2>Database Metrics</h2>
        <div className="performance-metrics">
          <PerformanceMetric 
            title="Average Query Time" 
            value={metrics.avgQueryTime || 250} 
            unit="ms" 
            description="Average time for query execution"
          />
          <PerformanceMetric 
            title="Database Size" 
            value={metrics.databaseSize || 128} 
            unit="MB" 
            description="Total size of the database"
          />
          <PerformanceMetric 
            title="Active Connections" 
            value={metrics.activeConnections || 5} 
            unit="" 
            description="Current active database connections"
          />
          <PerformanceMetric 
            title="Index Usage" 
            value={metrics.indexUsage || 65} 
            unit="%" 
            description="Percentage of queries using indexes"
          />
        </div>
      </section>
      
      <section>
        <h2>Optimization Challenges</h2>
        <div className="challenges-list">
          {mockChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard; 