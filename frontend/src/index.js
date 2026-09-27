import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './i18n'; // import config

// Suppress generic cross-origin & browser extension errors (translate-page, save-page, installHook)
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    const msg = event.message || "";
    if (msg === "Script error." || msg.includes("Script error") || msg.includes("translate-page") || msg.includes("save-page")) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason ? (event.reason.message || String(event.reason)) : "";
    if (reason.includes("translate-page") || reason.includes("save-page") || reason.includes("menu item") || reason.includes("Cannot find menu item")) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  });
}

// ✅ Use only createRoot (React 18+)
const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);