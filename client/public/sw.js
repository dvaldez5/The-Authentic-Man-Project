const CACHE_NAME = 'am-project-v14-enhanced-features';
const STATIC_CACHE = 'am-static-v14';
const DYNAMIC_CACHE = 'am-dynamic-v14';
const OFFLINE_CACHE = 'am-offline-v14';

const urlsToCache = [
  '/manifest.json',
  '/app-icon-192.png',
  '/app-icon-512.png',
  '/notification-icon-192.png',
  '/notification-icon-monochrome.svg',
  '/images/logo-inverted.svg'
  // REMOVED '/' from cache to ensure fresh PWA detection logic
];

// Core app routes that work offline
const OFFLINE_ROUTES = [
  '/dashboard',
  '/journal',
  '/journal/pinned',
  '/settings',
  '/learning',
  '/challenges'
];

// API endpoints that should be cached for offline access
const CACHE_FIRST_APIS = [
  '/api/user',
  '/api/journal/entries',
  '/api/dashboard/stats',
  '/api/learning/progress'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE, OFFLINE_CACHE].includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim clients
      self.clients.claim(),
      // Initialize background sync store
      self.registration.sync && self.registration.sync.register('background-sync')
    ])
  );
});

// Handle notification permission requests
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'REQUEST_NOTIFICATION_PERMISSION') {
    // Service Worker can sometimes bypass permission restrictions
    self.registration.showNotification('Permission Test', {
      body: 'Testing notifications from Service Worker',
      icon: '/app-icon-192.png',
      badge: '/app-icon-96.png',
      tag: 'permission-test',
      requireInteraction: false
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    }).catch((error) => {
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }
});

// Background sync for data persistence
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncPendingData());
  }
});

// Periodic background sync for fresh data
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-sync') {
    event.waitUntil(periodicDataSync());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/app-icon-192.png',
    badge: '/notification-icon-192.png',
    data: data.data || {},
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    tag: data.tag || 'general',
    requireInteraction: data.requireInteraction || false,
    timestamp: Date.now()
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }

  const data = event.notification.data || {};
  const url = data.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          if (event.action === 'open' || !event.action) {
            client.navigate(url);
          }
          return;
        }
      }
      
      // Open new window if none exists
      if (event.action === 'open' || !event.action) {
        return clients.openWindow(url);
      }
    })
  );
});

// Background sync functions
async function syncPendingData() {
  try {
    // Get pending sync data from IndexedDB or localStorage
    const pendingData = await getPendingSync();
    
    for (const item of pendingData) {
      try {
        const response = await fetch(item.url, {
          method: item.method || 'POST',
          headers: item.headers || { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          await removePendingSync(item.id);
        }
      } catch (error) {
        console.log('Sync failed for item:', item.id);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

async function periodicDataSync() {
  try {
    // Refresh critical data in background
    const endpointsToRefresh = [
      '/api/daily-challenge',
      '/api/dashboard/stats',
      '/api/user'
    ];
    
    for (const endpoint of endpointsToRefresh) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const cache = await caches.open(DYNAMIC_CACHE);
          cache.put(endpoint, response.clone());
        }
      } catch (error) {
        console.log('Periodic sync failed for:', endpoint);
      }
    }
  } catch (error) {
    console.log('Periodic sync failed:', error);
  }
}

// Helper functions for background sync storage
async function getPendingSync() {
  try {
    const stored = localStorage.getItem('am-pending-sync');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function removePendingSync(id) {
  try {
    const pending = await getPendingSync();
    const filtered = pending.filter(item => item.id !== id);
    localStorage.setItem('am-pending-sync', JSON.stringify(filtered));
  } catch (error) {
    console.log('Failed to remove pending sync item:', error);
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle navigation requests (page loads)
  if (event.request.mode === 'navigate') {
    // CRITICAL PWA FIX: Always fetch fresh content for root route to ensure PWA detection works
    const isRootRoute = url.pathname === '/' || url.pathname === '';
    
    if (isRootRoute) {
      // Network-first strategy for root route to ensure fresh PWA detection logic
      event.respondWith(
        fetch(event.request, { cache: 'no-cache' })
          .then((response) => {
            if (response.ok) {
              return response;
            }
            return caches.match('/');
          })
          .catch(() => {
            return caches.match('/') || new Response(
              '<html><body style="background:#2D1B14;color:white;font-family:sans-serif;text-align:center;padding:2rem;"><h1>AM Project</h1><p>You are offline. The app is cached and ready when you reconnect.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          })
      );
      return;
    }
    
    // Enhanced offline support for app routes
    if (OFFLINE_ROUTES.includes(url.pathname)) {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              // Cache successful responses
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then(cache => {
                cache.put(event.request, responseClone);
              });
              return response;
            }
            // Fallback to cached version
            return caches.match(event.request) || caches.match('/');
          })
          .catch(() => {
            // Return cached version or offline fallback
            return caches.match(event.request) || caches.match('/') || new Response(
              '<html><body style="background:#2D1B14;color:white;font-family:sans-serif;text-align:center;padding:2rem;"><h1>AM Project</h1><p>You are offline. Some features may be limited.</p><a href="/dashboard" style="color:#E4B768;">Go to Dashboard</a></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          })
      );
      return;
    }
    
    // For other routes, use normal caching strategy
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            return response;
          }
          return caches.match('/');
        })
        .catch(() => {
          return caches.match('/');
        })
    );
    return;
  }
  
  // Handle API requests with caching strategy
  if (url.pathname.startsWith('/api/')) {
    // Cache-first strategy for user data and dashboard stats
    if (CACHE_FIRST_APIS.some(api => url.pathname.startsWith(api))) {
      event.respondWith(
        caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              // Return cached version and update in background
              fetch(event.request)
                .then((response) => {
                  if (response.ok) {
                    caches.open(DYNAMIC_CACHE).then(cache => {
                      cache.put(event.request, response.clone());
                    });
                  }
                })
                .catch(() => {}); // Silent fail for background update
              return cachedResponse;
            }
            
            // No cache, fetch and cache
            return fetch(event.request)
              .then((response) => {
                if (response.ok) {
                  const responseClone = response.clone();
                  caches.open(DYNAMIC_CACHE).then(cache => {
                    cache.put(event.request, responseClone);
                  });
                }
                return response;
              });
          })
      );
      return;
    }
    
    // Network-first for other API requests (mutations)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok && event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(event.request) || new Response(
            JSON.stringify({ error: 'Offline - data not available' }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }
  
  // Handle static assets (cache-first)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          });
      })
  );
});