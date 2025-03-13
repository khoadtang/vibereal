/**
 * Debug helper for ProductSearch component
 * 
 * This file contains utility functions that can be used in the browser console
 * to help debug issues with the ProductSearch component.
 */

// Sample product data that can be injected
const sampleProducts = [
  {
    id: "sample-1",
    name: "Smartphone X Pro",
    description: "Latest flagship smartphone with incredible camera and performance.",
    price: "999.99",
    category_id: 3,
    category_name: "Smartphones",
    stock_quantity: 15
  },
  {
    id: "sample-2",
    name: "Laptop Ultra",
    description: "Powerful laptop for professionals and gamers alike.",
    price: "1299.99",
    category_id: 2,
    category_name: "Computers",
    stock_quantity: 10
  },
  {
    id: "sample-3",
    name: "Wireless Headphones",
    description: "Premium noise-cancelling headphones with crystal clear sound.",
    price: "249.99",
    category_id: 4,
    category_name: "Audio",
    stock_quantity: 25
  },
  {
    id: "sample-4",
    name: "Smart Watch",
    description: "Track your fitness and stay connected with this advanced smart watch.",
    price: "199.99",
    category_id: 1,
    category_name: "Electronics",
    stock_quantity: 30
  },
  {
    id: "sample-5",
    name: "4K TV",
    description: "Immersive viewing experience with this large 4K smart TV.",
    price: "799.99",
    category_id: 1,
    category_name: "Electronics",
    stock_quantity: 8
  },
  {
    id: "sample-6",
    name: "Coffee Maker",
    description: "Start your day right with this programmable coffee maker.",
    price: "79.99",
    category_id: 8,
    category_name: "Home & Kitchen",
    stock_quantity: 20
  }
];

// Function to manually set products in the ProductSearch component
window.fixProductSearch = function() {
  console.log('⚠️ Attempting to manually fix products display');
  
  // Find the ProductSearch component instance
  const searchComponent = Array.from(document.querySelectorAll('*'))
    .find(el => el._reactInternalInstance && el._owner?.stateNode?.constructor?.name === 'ProductSearch');
  
  if (searchComponent && searchComponent._owner?.stateNode) {
    const instance = searchComponent._owner.stateNode;
    
    // Set the products directly
    if (instance.setProducts) {
      console.log('✅ Found component, injecting sample products!');
      instance.setProducts(sampleProducts);
      console.log('✅ Successfully injected sample products!');
      return true;
    }
  }
  
  console.log('❌ Could not find ProductSearch component. Try running this from the product search page.');
  
  // Alternative approach - set products in local storage
  try {
    console.log('Attempting localStorage fallback...');
    localStorage.setItem('debug_products', JSON.stringify(sampleProducts));
    console.log('✅ Saved sample products to localStorage. Refresh the page to apply.');
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
  
  // Inject products into the global window object as a last resort
  console.log('Setting window.debugProducts as last resort');
  window.debugProducts = sampleProducts;
  
  return false;
};

// Function to check what's happening with API calls
window.debugProductAPI = function() {
  const originalFetch = window.fetch;
  const originalXHR = window.XMLHttpRequest.prototype.open;
  
  // Override fetch to log API calls
  window.fetch = function(...args) {
    console.log('🔍 Fetch API call:', args);
    return originalFetch.apply(this, args);
  };
  
  // Override XHR to log API calls
  window.XMLHttpRequest.prototype.open = function(...args) {
    console.log('🔍 XHR request:', args);
    return originalXHR.apply(this, args);
  };
  
  console.log('🔍 API debugging enabled. All API calls will be logged to console.');
  
  // Auto-fix after 5 seconds if no products are loaded
  setTimeout(() => {
    const productHeading = document.querySelector('h2:contains("Products")');
    if (productHeading && productHeading.textContent.includes('Products (0)')) {
      console.log('🔄 No products detected after 5 seconds, attempting auto-fix...');
      window.fixProductSearch();
    }
  }, 5000);
};

// Export the functions for use in React components
export const debugHelpers = {
  sampleProducts,
  fixProductSearch: window.fixProductSearch,
  debugProductAPI: window.debugProductAPI
};

export default debugHelpers; 