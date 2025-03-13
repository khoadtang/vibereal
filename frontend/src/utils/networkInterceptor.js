/**
 * Network Request Interceptor
 * 
 * This module intercepts network requests to prevent placeholder image requests
 * and replace them with locally generated SVG images.
 */

// Function to generate a placeholder SVG based on product text and dimensions
const generatePlaceholderSVG = (text, width = 300, height = 300) => {
  // Create a deterministic color based on the text
  const hash = String(text).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['#4299E1', '#48BB78', '#ED8936', '#9F7AEA', '#F56565'];
  const bgColor = colors[hash % colors.length];
  
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}" />
    <text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" dominant-baseline="middle" fill="white">${text}</text>
  </svg>`;
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Store the original fetch function
const originalFetch = window.fetch;

// Override fetch to intercept placeholder requests
window.fetch = async function(resource, options) {
  if (typeof resource === 'string') {
    // Check if this is a placeholder request
    if (resource.includes('placeholder.com') || 
        (resource.includes('300x300') && resource.includes('?text=')) ||
        resource.includes('via.placeholder.com')) {
      console.log('🚫 Blocked placeholder request:', resource);
      
      // Extract dimensions and text from URL
      const dimensions = resource.match(/(\d+)x(\d+)/);
      const width = dimensions ? parseInt(dimensions[1]) : 300;
      const height = dimensions ? parseInt(dimensions[2]) : 300;
      
      const textMatch = resource.match(/text=([^&]+)/);
      const text = textMatch ? decodeURIComponent(textMatch[1]) : 'Product';
      
      // Create a fake successful response with SVG data
      const svgData = generatePlaceholderSVG(text, width, height);
      
      // Return a blob that can be used as an image source
      const blob = await fetch(svgData).then(r => r.blob());
      return new Response(blob, {
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'Content-Type': 'image/svg+xml',
          'Content-Length': String(blob.size),
        }),
      });
    }
  }
  
  // For all other requests, use the original fetch
  return originalFetch.apply(this, arguments);
};

// Also handle image error events to replace broken images with SVG placeholders
document.addEventListener('error', function(e) {
  if (e.target.tagName === 'IMG') {
    const img = e.target;
    const productId = img.getAttribute('data-product-id') || Math.floor(Math.random() * 1000);
    
    // Generate SVG for the broken image
    img.src = generatePlaceholderSVG(`Product ${productId}`, 300, 300);
    
    // Prevent further error events for this image
    img.onerror = null;
  }
}, true);

// Set up MutationObserver to catch and replace placeholder images as they're added to the DOM
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'src' && mutation.target.tagName === 'IMG') {
      const img = mutation.target;
      const src = img.getAttribute('src');
      
      if (src && (src.includes('placeholder.com') || 
                 (src.includes('300x300') && src.includes('?text=')) ||
                  src.includes('via.placeholder.com'))) {
        console.log('🔄 Replacing placeholder image via MutationObserver:', src);
        const productId = img.getAttribute('data-product-id') || Math.floor(Math.random() * 1000);
        img.src = generatePlaceholderSVG(`Product ${productId}`, 300, 300);
      }
    }
  });
});

// Start observing the entire document
observer.observe(document.documentElement, { 
  attributes: true, 
  childList: true, 
  subtree: true,
  attributeFilter: ['src']
});

console.log('Network interceptor installed - blocking placeholder.com requests'); 