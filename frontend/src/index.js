// Direct placeholder blocking script - must run before anything else
(() => {
  // Block placeholder.com at the most fundamental level
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "img-src 'self' data: https://picsum.photos https://*.unsplash.com; default-src 'self' 'unsafe-inline' 'unsafe-eval' data: http://localhost:* https://localhost:* https://picsum.photos https://*.unsplash.com";
  document.head.appendChild(meta);
  
  // Replace any placeholder images with picsum photos
  const replaceAllPlaceholders = () => {
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && (src.includes('placeholder.com') || src.includes('300x300') || src.includes('?text='))) {
        console.log('🧹 Replacing placeholder image:', src);
        // Get a stable ID for this element to ensure consistent replacements
        const elementId = img.id || Math.floor(Math.random() * 1000);
        const photoId = elementId % 1000 || 921;
        img.src = `https://picsum.photos/id/${photoId}/800/600`;
      }
    });
  };
  
  // Run immediately and on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', replaceAllPlaceholders);
  } else {
    replaceAllPlaceholders();
  }
  
  // Also watch for new elements
  const observer = new MutationObserver(mutations => {
    let needsReplace = false;
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        needsReplace = true;
      }
    });
    
    if (needsReplace) {
      replaceAllPlaceholders();
    }
  });
  
  // Start observing when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();

// Import network interceptor first to prevent placeholder.com requests
// This MUST be the first import to intercept all network requests
import './utils/networkInterceptor';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/animations.css'; // Import our animations CSS
import App from './App';
import reportWebVitals from './reportWebVitals';
// Import debug helper to make it available throughout the app
import './utils/debugHelper';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Log a message to help users know about the debug tools
if (process.env.NODE_ENV !== 'production') {
  console.log('Debug tools available! Use "fixProductSearch()" in console if product list is empty.');
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Add a developer utility to the window object
window.toggleDevInfo = function() {
  const devElements = document.querySelectorAll('[data-developer="true"]');
  devElements.forEach(el => {
    if (el.style.display === 'none') {
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  });
  
  const codeBlocks = document.querySelectorAll('.code-block');
  codeBlocks.forEach(block => {
    if (block.style.display === 'none') {
      block.style.display = 'block';
    } else {
      block.style.display = 'none';
    }
  });
  
  const placeholders = document.querySelectorAll('.code-block-placeholder');
  placeholders.forEach(placeholder => {
    if (placeholder.style.display === 'none') {
      placeholder.style.display = 'block';
    } else {
      placeholder.style.display = 'none';
    }
  });
  
  console.info('Developer information visibility toggled. To toggle again, run: window.toggleDevInfo()');
};

// Log a helpful message for developers
console.info('Developer utility available. Run window.toggleDevInfo() to show database information.'); 