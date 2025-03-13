import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SQLCodeBlock from '../components/SQLCodeBlock';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '2023-01-01',
    endDate: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });
  
  // Use the Nginx proxy path instead of direct API URL
  // const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  
  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);
  
  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`/api/reports/sales-by-category`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      
      setSalesData(response.data);
      
      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));
    } catch (err) {
      setError('Error fetching sales data. Please try again.');
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle date range changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Prepare chart data
  const chartData = {
    labels: salesData.map(item => item.name),
    datasets: [
      {
        label: 'Sales by Category',
        data: salesData.map(item => parseFloat(item.total_sales)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales by Category',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Sales ($)',
        },
      },
    },
  };
  
  // Example slow query for demonstration
  const slowQuery = `
SELECT c.id, c.name, SUM(oi.quantity * oi.unit_price) as total_sales
FROM ecommerce.orders o
JOIN ecommerce.order_items oi ON o.id = oi.order_id
JOIN ecommerce.products p ON oi.product_id = p.id
JOIN ecommerce.categories c ON p.category_id = c.id
WHERE o.created_at BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
GROUP BY c.id, c.name
ORDER BY total_sales DESC;
  `;
  
  // Example optimized query for demonstration
  const optimizedQuery = `
-- Create indexes to optimize the query
CREATE INDEX idx_orders_created_at ON ecommerce.orders(created_at);
CREATE INDEX idx_order_items_order_id ON ecommerce.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON ecommerce.order_items(product_id);
CREATE INDEX idx_products_category_id ON ecommerce.products(category_id);

-- Create a materialized view for better performance
CREATE MATERIALIZED VIEW ecommerce.mv_sales_by_category AS
SELECT 
    c.id, 
    c.name, 
    SUM(oi.quantity * oi.unit_price) as total_sales,
    DATE_TRUNC('month', o.created_at) as sales_month
FROM ecommerce.orders o
JOIN ecommerce.order_items oi ON o.id = oi.order_id
JOIN ecommerce.products p ON oi.product_id = p.id
JOIN ecommerce.categories c ON p.category_id = c.id
GROUP BY c.id, c.name, sales_month;

-- Create an index on the materialized view
CREATE INDEX idx_mv_sales_by_category_month ON ecommerce.mv_sales_by_category(sales_month);

-- Query the materialized view instead
SELECT id, name, SUM(total_sales) as total_sales
FROM ecommerce.mv_sales_by_category
WHERE sales_month BETWEEN DATE_TRUNC('month', '${dateRange.startDate}'::date) 
                      AND DATE_TRUNC('month', '${dateRange.endDate}'::date)
GROUP BY id, name
ORDER BY total_sales DESC;
  `;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Sales Reports</h1>
      
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Performance Challenge</h2>
        <p className="mb-4">
          This page demonstrates a common performance issue with reporting queries in PostgreSQL. 
          The current query performs complex joins and aggregations without proper indexes or materialized views.
        </p>
        <p>
          Try changing the date range and notice the execution time. Then optimize the query with materialized views and proper indexes.
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="self-end">
            <button
              onClick={fetchSalesData}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>
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
        <h2 className="text-xl font-bold mb-4">Sales by Category</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Loading sales data...</p>
          </div>
        ) : salesData.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
            <div className="mb-6" style={{ height: '400px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Sales
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${parseFloat(item.total_sales).toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p>No sales data available for the selected date range.</p>
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
              <strong>Create indexes on join and filter columns:</strong> This improves JOIN and WHERE clause performance.
            </li>
            <li>
              <strong>Use a materialized view:</strong> Pre-compute and store the aggregated data for faster retrieval.
            </li>
            <li>
              <strong>Add date truncation:</strong> Group by month to reduce the granularity of the data and improve performance.
            </li>
            <li>
              <strong>Create an index on the materialized view:</strong> This makes filtering by date range very fast.
            </li>
            <li>
              <strong>Schedule regular refreshes:</strong> Set up a job to refresh the materialized view periodically.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Reports; 