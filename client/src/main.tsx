import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// React instance conflict resolved - diagnostic code removed


// PWA meta tags and fonts are handled by index.html for better performance

// Production-gated PWA Service Worker registration
// This prevents React instance conflicts in dev/preview by only enabling SW on production app domain
try {
  const isProd = import.meta.env.PROD;
  const host = location.hostname;
  const isProdAppHost = host === 'app.theamproject.com'; // production app domain only
  
  if (isProd && isProdAppHost && 'serviceWorker' in navigator) {
    // ✅ Production app: Register service worker
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
  } else {
    // 🚫 Dev/Preview/Marketing: Ensure no service worker is active and clean up caches
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(registrations => registrations.forEach(reg => reg.unregister()))
        .catch(() => {});
    }
    if ('caches' in window) {
      caches.keys()
        .then(keys => keys.forEach(key => caches.delete(key)))
        .catch(() => {});
    }
    console.log('Service worker disabled in development/preview environment');
    
    // AGGRESSIVE DEV CACHE CLEARING: Prevent dual React chunks
    // Clear all browser caches that could serve stale React chunks
    if (!isProd) {
      try {
        // Clear all types of browser cache storage
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations()
            .then(regs => regs.forEach(reg => reg.unregister()));
        }
        if ('caches' in window) {
          caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
        }
        // Force reload if we detect stale React chunks
        const scripts = Array.from(document.querySelectorAll('script[src*="chunk-"]'));
        const hasOldChunks = scripts.some(script => {
          const scriptElement = script as HTMLScriptElement;
          return scriptElement.src && scriptElement.src.includes('0fad10b2');
        });
        if (hasOldChunks) {
          console.warn('Detected stale React chunks - performing hard reload');
          window.location.reload();
        }
      } catch (cacheError) {
        console.warn('Cache clearing failed:', cacheError);
      }
    }
  }
} catch (error) {
  console.warn('Failed to handle service worker registration:', error);
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
