import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './i18n'; // import config

// Suppress generic cross-origin browser extension "Script error." overlays
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    if (event.message === "Script error." || (event.message && event.message.includes("Script error"))) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);
}

// ✅ Use only createRoot (React 18+)
const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);