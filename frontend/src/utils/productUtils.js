import { v5 as uuidv5 } from 'uuid';

// Categories for product images
const PRODUCT_CATEGORIES = {
  '0': 'electronics',
  '1': 'fashion',
  '2': 'home',
  '3': 'beauty',
  '4': 'sports',
  '5': 'toys',
  '6': 'books',
  '7': 'food',
  '8': 'office',
  '9': 'automotive',
  'a': 'technology',
  'b': 'jewelry',
  'c': 'garden',
  'd': 'pets',
  'e': 'art',
  'f': 'music'
};

// Subcategories for more specific images
const SUBCATEGORIES = {
  'electronics': ['gadget', 'computer', 'phone', 'camera', 'headphone', 'speaker', 'watch', 'tablet'],
  'fashion': ['clothing', 'shoes', 'accessories', 'bag', 'dress', 'suit', 'casual', 'formal'],
  'home': ['furniture', 'decor', 'kitchen', 'bedroom', 'bathroom', 'living', 'dining', 'outdoor'],
  'beauty': ['makeup', 'skincare', 'haircare', 'fragrance', 'nail', 'tools', 'sets', 'organic'],
  'sports': ['fitness', 'outdoor', 'water', 'team', 'winter', 'cycling', 'running', 'yoga'],
  'toys': ['educational', 'action', 'board', 'puzzle', 'electronic', 'plush', 'outdoor', 'creative'],
  'books': ['fiction', 'nonfiction', 'children', 'textbook', 'comic', 'reference', 'biography', 'self-help'],
  'food': ['snack', 'beverage', 'bakery', 'organic', 'gourmet', 'international', 'candy', 'health'],
  'office': ['stationery', 'furniture', 'supplies', 'organization', 'electronics', 'paper', 'writing', 'storage'],
  'automotive': ['interior', 'exterior', 'parts', 'accessories', 'tools', 'care', 'electronics', 'safety'],
  'technology': ['computer', 'mobile', 'audio', 'gaming', 'smart-home', 'accessories', 'camera', 'wearable'],
  'jewelry': ['necklace', 'ring', 'earring', 'bracelet', 'watch', 'gemstone', 'gold', 'silver'],
  'garden': ['plants', 'tools', 'furniture', 'decor', 'lighting', 'pots', 'seeds', 'equipment'],
  'pets': ['food', 'toys', 'accessories', 'bed', 'grooming', 'health', 'clothing', 'travel'],
  'art': ['painting', 'sculpture', 'print', 'photography', 'drawing', 'digital', 'craft', 'supplies'],
  'music': ['instrument', 'accessory', 'vinyl', 'equipment', 'headphone', 'speaker', 'recording', 'sheet']
};

// Color schemes for different product categories
const COLOR_SCHEMES = {
  'electronics': ['blue', 'black', 'silver', 'white'],
  'fashion': ['red', 'blue', 'black', 'white', 'pink', 'green'],
  'home': ['beige', 'brown', 'gray', 'white', 'black'],
  'beauty': ['pink', 'purple', 'white', 'gold'],
  'sports': ['blue', 'red', 'black', 'green', 'orange'],
  'toys': ['red', 'blue', 'yellow', 'green', 'purple'],
  'books': ['blue', 'red', 'green', 'brown', 'black'],
  'food': ['red', 'green', 'yellow', 'brown', 'white'],
  'office': ['black', 'gray', 'blue', 'white'],
  'automotive': ['black', 'silver', 'red', 'blue'],
  'technology': ['black', 'white', 'silver', 'blue'],
  'jewelry': ['gold', 'silver', 'white', 'black', 'red'],
  'garden': ['green', 'brown', 'terracotta', 'blue', 'white'],
  'pets': ['blue', 'red', 'green', 'brown', 'pink'],
  'art': ['white', 'black', 'blue', 'red', 'yellow'],
  'music': ['black', 'brown', 'silver', 'red', 'blue']
};

/**
 * Generates a consistent product image URL based on product ID
 * @param {string} productId - The product ID
 * @param {number} width - Image width (default: 400)
 * @param {number} height - Image height (default: 400)
 * @returns {string} - Image URL
 */
export const getProductImage = (productId, width = 400, height = 400) => {
  if (!productId) return `https://via.placeholder.com/${width}x${height}?text=Product`;
  
  // Normalize the product ID to ensure consistent results
  let normalizedId = productId;
  
  // If the ID is not in UUID format, create a deterministic UUID
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) {
    // For numeric IDs, pad to 3 digits and create a deterministic UUID
    if (/^\d+$/.test(productId)) {
      normalizedId = `00000000-0000-4000-a000-000000000${productId.padStart(3, '0')}`;
    } else {
      // For non-numeric, non-UUID IDs, create a UUID using a namespace
      const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // A random UUID as namespace
      normalizedId = uuidv5(productId.toString(), NAMESPACE);
    }
  }
  
  // Get the first character of the UUID to determine category
  const firstChar = normalizedId.charAt(0).toLowerCase();
  const category = PRODUCT_CATEGORIES[firstChar] || 'technology';
  
  // Use more characters from the UUID to create variation
  const secondChar = normalizedId.charAt(1).toLowerCase();
  const thirdChar = normalizedId.charAt(2).toLowerCase();
  
  // Get subcategory based on the second character
  const subcategoryIndex = parseInt(secondChar, 16) % SUBCATEGORIES[category].length;
  const subcategory = SUBCATEGORIES[category][subcategoryIndex];
  
  // Get color based on the third character
  const colorIndex = parseInt(thirdChar, 16) % COLOR_SCHEMES[category].length;
  const color = COLOR_SCHEMES[category][colorIndex];
  
  // Create a seed from the product ID for consistent but unique images
  const seed = normalizedId.replace(/-/g, '').substring(0, 8);
  
  // Use Unsplash Source for realistic product images
  return `https://source.unsplash.com/${seed}/${width}x${height}?${category},${subcategory},${color},product`;
};

/**
 * Formats a price with proper currency symbol and decimals
 * @param {number|string} price - The price to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted price
 */
export const formatPrice = (price, currency = 'USD') => {
  if (price === undefined || price === null) return '$0.00';
  
  // Convert to number if it's a string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Handle NaN
  if (isNaN(numericPrice)) return '$0.00';
  
  // Format based on currency
  switch (currency) {
    case 'USD':
      return `$${numericPrice.toFixed(2)}`;
    case 'EUR':
      return `€${numericPrice.toFixed(2)}`;
    case 'GBP':
      return `£${numericPrice.toFixed(2)}`;
    default:
      return `${numericPrice.toFixed(2)} ${currency}`;
  }
};

/**
 * Generates a star rating component based on a rating value
 * @param {number} rating - Rating value (0-5)
 * @param {number} maxRating - Maximum rating (default: 5)
 * @returns {Object} - Rating information for rendering
 */
export const getRatingInfo = (rating, maxRating = 5) => {
  if (rating === undefined || rating === null) {
    rating = 0;
  }
  
  // Convert to number if it's a string
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  
  // Handle NaN
  if (isNaN(numericRating)) {
    rating = 0;
  }
  
  // Ensure rating is between 0 and maxRating
  const clampedRating = Math.max(0, Math.min(numericRating, maxRating));
  
  // Calculate full and half stars
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating - fullStars >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
  
  return {
    rating: clampedRating,
    fullStars,
    hasHalfStar,
    emptyStars,
    percentage: (clampedRating / maxRating) * 100
  };
};

/**
 * Truncates text to a specified length and adds ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generates a discount badge if a product has a discount
 * @param {number} originalPrice - Original price
 * @param {number} currentPrice - Current price
 * @returns {Object|null} - Discount information or null if no discount
 */
export const getDiscountInfo = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) {
    return null;
  }
  
  const discount = originalPrice - currentPrice;
  const discountPercentage = Math.round((discount / originalPrice) * 100);
  
  return {
    originalPrice,
    currentPrice,
    discount,
    discountPercentage,
    formattedDiscount: `${discountPercentage}% OFF`
  };
};

export default {
  getProductImage,
  formatPrice,
  getRatingInfo,
  truncateText,
  getDiscountInfo
}; 