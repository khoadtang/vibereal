import React from 'react';
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

function App() {
  return (
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
      </div>
    </ToastProvider>
  );
}

export default App; 