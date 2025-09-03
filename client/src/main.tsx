import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Step 0: Confirm React duplication (temporary diagnostic)
console.log('React runtime version:', React.version);
console.log(
  'Renderers:',
  Object.values((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers ?? {})
    .map((r: any) => r?.version ?? 'unknown')
);


// PWA meta tags and fonts are handled by index.html for better performance

// Register PWA Service Worker with forced updates
try {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(async (registration) => {
        // Force immediate update for downloaded PWAs
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Listen for updates and reload when new version available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                window.location.reload();
              }
            });
          }
        });
        
        console.log('PWA Service Worker registered');
      })
      .catch(err => console.log('PWA Service Worker registration failed:', err));
  }
} catch (error) {
  console.warn('Failed to register service worker:', error);
}

// Safely render React app
try {
  const rootElement = document.getElementById("root");
  if (rootElement && typeof createRoot !== 'undefined') {
    createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
} catch (error) {
  console.error('Failed to render React app:', error);
}
