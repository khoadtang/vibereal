import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Create a function to fetch cart count that can be called multiple times
  const fetchCartCount = async () => {
    // For demo purposes, we'll use a hardcoded user ID
    const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    try {
      const response = await fetch(`/api/cart/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.items) {
          setCartCount(data.items.length);
        } else {
          setCartCount(0); // Set to 0 if no items
        }
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      // Set a default count for demo purposes
      setCartCount(3);
    }
  };
  
  // Fetch cart count on component mount
  useEffect(() => {
    fetchCartCount();
    
    // Set up demo categories for navigation
    setCategories([
      {
        id: 1,
        name: 'Electronics',
        path: '/products?category=Electronics'
      },
      {
        id: 2,
        name: 'Fashion',
        path: '/products?category=Fashion'
      },
      {
        id: 3,
        name: 'Home & Kitchen',
        path: '/products?category=Home & Kitchen'
      },
      {
        id: 4,
        name: 'Books',
        path: '/products?category=Books'
      },
      {
        id: 5,
        name: 'Beauty',
        path: '/products?category=Beauty'
      },
      {
        id: 6,
        name: 'Toys',
        path: '/products?category=Toys'
      }
    ]);
  }, []);
  
  // Listen for location changes (route changes) and refresh cart count
  useEffect(() => {
    fetchCartCount();
  }, [location.pathname]);
  
  // Create a custom event listener for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    
    // Listen for custom event for cart updates
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };
  
  return (
    <header className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white shadow-lg sticky top-0 z-50">
      {/* Top bar with logo and search */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-yellow-400">Vibe</span>
                <span className="text-white">Real</span>
              </span>
            </Link>
          </div>
          
          {/* Search bar */}
          <div className="w-full md:max-w-2xl">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="search"
                  className="block w-full p-3 pl-10 text-sm text-gray-900 bg-white rounded-l-lg border-0 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setSearchTerm('')}
                >
                  {searchTerm && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                type="submit"
                className="p-3 bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-medium rounded-r-lg transition-colors focus:ring-2 focus:ring-yellow-300 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
          
          {/* Cart and account links */}
          <div className="flex items-center space-x-4">
            <Link to="/orders" className="flex items-center hover:text-yellow-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="hidden md:inline">Orders</span>
            </Link>
            
            <Link to="/cart" className="flex items-center hover:text-yellow-200 transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden md:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-indigo-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            
            <button 
              className="md:hidden flex items-center"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Categories navigation */}
      <nav className="bg-indigo-800 py-2 px-4 hidden md:block">
        <div className="container mx-auto flex items-center space-x-8">
          <div className="relative group">
            <button className="flex items-center text-white hover:text-yellow-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              All Categories
            </button>
            <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
              <div className="py-1">
                {categories.map(category => (
                  <Link
                    key={category.id}
                    to={category.path}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-900"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {categories.slice(0, 5).map(category => (
            <Link
              key={category.id}
              to={category.path}
              className="text-white hover:text-yellow-200 transition-colors text-sm"
            >
              {category.name}
            </Link>
          ))}
          
          <Link to="/challenges" className="text-white hover:text-yellow-200 transition-colors text-sm">
            Challenges
          </Link>
          
          <Link to="/reports" className="text-white hover:text-yellow-200 transition-colors text-sm">
            Reports
          </Link>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-indigo-800 px-4 py-2">
          <div className="flex flex-col space-y-2">
            {categories.map(category => (
              <Link
                key={category.id}
                to={category.path}
                className="text-white hover:text-yellow-200 transition-colors py-2 border-b border-indigo-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <Link 
              to="/challenges" 
              className="text-white hover:text-yellow-200 transition-colors py-2 border-b border-indigo-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Challenges
            </Link>
            <Link 
              to="/reports" 
              className="text-white hover:text-yellow-200 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reports
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 