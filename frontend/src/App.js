import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductSearch from './pages/ProductSearch';
import ProductDetail from './pages/ProductDetail';
import ShoppingCart from './pages/ShoppingCart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Reports from './pages/Reports';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import { ToastProvider } from './components/ToastProvider';
import DatabaseInitStatus from './components/DatabaseInitStatus';
import { DatabaseConnectionProvider } from './contexts/DatabaseConnectionContext';
import DatabaseConnectionAlert from './components/DatabaseConnectionAlert';
import { initApiInterceptors, DB_CONNECTION_ERROR_EVENT } from './utils/apiInterceptor';

function App() {
  // Initialize API interceptors
  useEffect(() => {
    initApiInterceptors();
    
    // Add event listener for database connection errors
    const handleDbConnectionError = (event) => {
      console.warn('Database connection error detected:', event.detail);
      // The DatabaseConnectionAlert will be shown based on context state
    };
    
    window.addEventListener(DB_CONNECTION_ERROR_EVENT, handleDbConnectionError);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener(DB_CONNECTION_ERROR_EVENT, handleDbConnectionError);
    };
  }, []);

  return (
    <DatabaseConnectionProvider>
      <ToastProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductSearch />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<ShoppingCart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/challenges/:id" element={<ChallengeDetail />} />
            </Routes>
          </main>
          <Footer />
          <DatabaseInitStatus />
          <DatabaseConnectionAlert />
        </div>
      </ToastProvider>
    </DatabaseConnectionProvider>
  );
}

export default App; 
