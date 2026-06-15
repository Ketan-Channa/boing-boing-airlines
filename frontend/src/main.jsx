import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Intercept all fetch requests to prefix them with the backend URL in production
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  let apiBase = import.meta.env.VITE_API_URL || '';
  if (typeof url === 'string' && url.startsWith('/api')) {
    if (apiBase.endsWith('/')) {
      apiBase = apiBase.slice(0, -1);
    }
    url = `${apiBase}${url}`;
  }
  return originalFetch(url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
