import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('🔍 MAIN.TSX STARTING - Clean restart');

// Register PWA Service Worker
try {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(() => console.log('PWA Service Worker registered'))
      .catch(err => console.log('PWA Service Worker registration failed:', err));
  }
} catch (error) {
  console.warn('Failed to register service worker:', error);
}

// Render React app with detailed error tracking
try {
  console.log('🔍 Starting React render');
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error('🚨 Root element not found');
    throw new Error('Root element not found');
  }
  
  console.log('🔍 Creating React root');
  const root = createRoot(rootElement);
  
  console.log('🔍 Rendering App component');
  root.render(<App />);
  
  console.log('🔍 React app rendered successfully');
} catch (error) {
  console.error('🚨 React render failed:', error);
  console.error('🚨 Error details:', {
    name: error instanceof Error ? error.name : 'Unknown',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : 'No stack trace'
  });
  
  // Fallback display
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; background: #ff4444; color: white;">
        <h1>React App Failed to Load</h1>
        <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
        <p>Check console for details</p>
      </div>
    `;
  }
}
