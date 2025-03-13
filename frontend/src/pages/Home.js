import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductImage, formatPrice } from '../utils/productUtils';
import axios from 'axios';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Load real products from the database
    loadProducts();
    loadCategories();
  }, []);
  
  // Function to load real products from the database
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters to get all products
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '12'); // Limit to 12 products on the home page
      
      console.log("Fetching products from API");
      const response = await axios.get(`/api/products?${params.toString()}`);
      
      if (response.data && Array.isArray(response.data)) {
        // Direct array response
        setProducts(response.data);
        console.log("Set products from direct array response:", response.data.length);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Paginated response with data property
        setProducts(response.data.data);
        console.log("Set products from paginated response:", response.data.data.length);
      } else {
        console.error("Unexpected API response format:", response.data);
        setError("Received unexpected data format from API");
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(`Failed to load products: ${err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Load real categories
  const loadCategories = async () => {
    try {
      // You can replace this with an actual API call when available
      // For now, setting some default categories
      setCategories([
        { 
          id: 1, 
          name: 'Electronics', 
          image: 'https://source.unsplash.com/random/300x300/?electronics',
          path: '/products?category=Electronics'
        },
        { 
          id: 2, 
          name: 'Fashion', 
          image: 'https://source.unsplash.com/random/300x300/?fashion',
          path: '/products?category=Fashion'
        },
        { 
          id: 3, 
          name: 'Home & Kitchen', 
          image: 'https://source.unsplash.com/random/300x300/?kitchen',
          path: '/products?category=Home'
        },
        { 
          id: 4, 
          name: 'Books', 
          image: 'https://source.unsplash.com/random/300x300/?books',
          path: '/products?category=Books'
        },
        { 
          id: 5, 
          name: 'Beauty', 
          image: 'https://source.unsplash.com/random/300x300/?beauty',
          path: '/products?category=Beauty'
        },
        { 
          id: 6, 
          name: 'Sports & Outdoors', 
          image: 'https://source.unsplash.com/random/300x300/?sports',
          path: '/products?category=Sports'
        }
      ]);
    } catch (err) {
      console.error("Error setting up categories:", err);
    }
  };
  
  // Component to render star ratings
  const renderStars = (rating) => {
    if (!rating) return null;
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;
    
    return (
      <div className="flex items-center">
        {[...Array(totalStars)].map((_, i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${
              i < fullStars 
                ? 'text-yellow-400' 
                : i === fullStars && hasHalfStar 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {i === fullStars && hasHalfStar ? (
              <defs>
                <linearGradient id="halfGradient">
                  <stop offset="50%" stopColor="#FBBF24" />
                  <stop offset="50%" stopColor="#D1D5DB" />
                </linearGradient>
              </defs>
            ) : null}
            <path
              fillRule="evenodd"
              fill={i === fullStars && hasHalfStar ? "url(#halfGradient)" : "currentColor"}
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              clipRule="evenodd"
            />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="bg-gray-50">
      {/* Hero section */}
      <section className="relative bg-gradient-to-r from-indigo-900 to-indigo-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <img 
            src="https://source.unsplash.com/random/1920x600/?shopping,ecommerce" 
            alt="Hero background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Shop the Latest Trends
            </h1>
            <p className="text-xl mb-8 text-gray-100">
              Discover amazing products at unbeatable prices. Free shipping on orders over $50!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/products" 
                className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold px-6 py-3 rounded-lg transition-colors shadow-lg"
              >
                Shop Now
              </Link>
              <Link 
                to="/challenges" 
                className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-filter backdrop-blur-sm text-white px-6 py-3 rounded-lg transition-colors border border-white border-opacity-40"
              >
                View Challenges
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories section */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Shop by Category</h2>
          <Link to="/products" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(category => (
            <Link 
              key={category.id} 
              to={category.path}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform group-hover:scale-105">
                <div className="h-40 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition-transform transform group-hover:scale-110"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-medium text-gray-800">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Products section - Showing all products instead of "featured" */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Our Products</h2>
            <Link to="/products" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
              View All Products
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <Link 
                  key={product.id} 
                  to={`/products/${product.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100">
                    <div className="h-56 overflow-hidden bg-gray-100 relative">
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : getProductImage(product.id)} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform transform group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null; 
                          // Use a local SVG instead of an external placeholder service
                          const hash = String(product.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          const colors = ['#4299E1', '#48BB78', '#ED8936', '#9F7AEA', '#F56565'];
                          const bgColor = colors[hash % colors.length];
                          
                          const svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="${bgColor}" />
                            <text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" dominant-baseline="middle" fill="white">${product.name}</text>
                          </svg>`;
                          
                          e.target.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
                        }}
                      />
                      {product.is_featured && (
                        <div className="absolute top-0 right-0 m-2 bg-yellow-400 text-indigo-900 text-xs font-bold rounded-full px-2 py-1">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="mb-2">
                        {renderStars(product.ratings ? product.ratings[0] : null)}
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-indigo-700">{formatPrice(product.price)}</span>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No products found. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Newsletter section */}
      <section className="py-16 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-xl mb-6 text-gray-100">
              Get the latest updates on new products, special promotions, and sales.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-800"
              />
              <button 
                type="submit" 
                className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold px-6 py-3 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-sm text-gray-200">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 