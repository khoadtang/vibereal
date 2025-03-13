import React from 'react';
import { Link } from 'react-router-dom';

const Challenges = () => {
  const challenges = [
    {
      id: 1,
      title: 'Product Search Optimization',
      description: 'Learn how to optimize product search queries with proper indexing and text search capabilities.',
      difficulty: 'Beginner',
      topics: ['Indexing', 'Text Search', 'LIKE Optimization'],
      path: '/challenges/1'
    },
    {
      id: 2,
      title: 'Shopping Cart Performance',
      description: 'Improve the performance of shopping cart operations with efficient joins and indexes.',
      difficulty: 'Intermediate',
      topics: ['Join Optimization', 'Foreign Keys', 'Composite Indexes'],
      path: '/challenges/2'
    },
    {
      id: 3,
      title: 'Order Processing Efficiency',
      description: 'Optimize order processing queries for better throughput and response times.',
      difficulty: 'Intermediate',
      topics: ['Transaction Processing', 'Batch Operations', 'Partial Indexes'],
      path: '/challenges/3'
    },
    {
      id: 4,
      title: 'User Management Queries',
      description: 'Learn how to efficiently query and update user data with proper indexing strategies.',
      difficulty: 'Beginner',
      topics: ['B-tree Indexes', 'Index-Only Scans', 'Covering Indexes'],
      path: '/challenges/4'
    },
    {
      id: 5,
      title: 'Reporting and Analytics',
      description: 'Optimize complex reporting queries with materialized views and efficient aggregations.',
      difficulty: 'Advanced',
      topics: ['Materialized Views', 'Aggregation', 'Window Functions'],
      path: '/challenges/5'
    },
    {
      id: 6,
      title: 'Full-Text Search Implementation',
      description: 'Implement efficient full-text search capabilities for product catalog.',
      difficulty: 'Advanced',
      topics: ['GIN Indexes', 'tsvector', 'Full-Text Search'],
      path: '/challenges/6'
    },
    {
      id: 7,
      title: 'Efficient Pagination',
      description: 'Implement efficient pagination for large result sets without performance degradation.',
      difficulty: 'Intermediate',
      topics: ['Keyset Pagination', 'OFFSET Alternatives', 'Cursor-based Pagination'],
      path: '/challenges/7'
    },
    {
      id: 8,
      title: 'Data Partitioning',
      description: 'Implement table partitioning for improved query performance on large tables.',
      difficulty: 'Advanced',
      topics: ['Table Partitioning', 'Partition Pruning', 'Range Partitioning'],
      path: '/challenges/8'
    },
    {
      id: 9,
      title: 'JSONB Data Optimization',
      description: 'Learn how to efficiently store and query semi-structured data using JSONB.',
      difficulty: 'Advanced',
      topics: ['JSONB', 'GIN Indexes', 'JSON Operators'],
      path: '/challenges/9'
    },
    {
      id: 10,
      title: 'Query Optimization Techniques',
      description: 'Master various query optimization techniques to improve overall database performance.',
      difficulty: 'Intermediate',
      topics: ['Query Rewriting', 'CTE Optimization', 'Subquery Optimization'],
      path: '/challenges/10'
    }
  ];

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Performance Challenges</h1>
        <p className="text-lg mb-6">
          Select a challenge to practice your PostgreSQL optimization skills. Each challenge focuses on specific performance issues and optimization techniques.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map(challenge => (
          <div key={challenge.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold">{challenge.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  challenge.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                  challenge.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{challenge.description}</p>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Topics:</h3>
                <div className="flex flex-wrap gap-2">
                  {challenge.topics.map(topic => (
                    <span key={topic} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              
              <Link 
                to={challenge.path} 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Challenge
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Challenges; 