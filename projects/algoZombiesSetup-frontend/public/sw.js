// Service Worker for AlgoZombies - Offline Functionality
const CACHE_NAME = 'algozombies-v1.0.0';
const STATIC_CACHE_NAME = 'algozombies-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'algozombies-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
  // Core pages
  '/lessons',
  '/about',
  '/dashboard',
  // Fallback page
  '/offline.html'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.algozombies\.com\/lessons/,
  /^https:\/\/api\.algozombies\.com\/progress/,
  /^https:\/\/api\.algozombies\.com\/user/
];

// Network timeout for fetch requests
const NETWORK_TIMEOUT = 5000;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(navigationStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }

    console.log('[SW] Fetching and caching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed for:', request.url, error);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    
    // Try network first with timeout
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
      )
    ]);

    if (networkResponse.ok) {
      console.log('[SW] Network success, updating cache:', request.url);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Add offline indicator header
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Served-From-Cache', 'true');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }

    // Return offline response for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This content is not available offline',
      cached: false
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Navigation strategy for page requests
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Navigation offline, serving cached page or fallback');
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    // Serve offline fallback page
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    // Last resort - basic offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AlgoZombies - Offline</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: #1a1a1a;
              color: #fff;
            }
            .offline-icon { font-size: 64px; margin-bottom: 20px; }
            .offline-title { font-size: 24px; margin-bottom: 10px; }
            .offline-message { color: #888; }
          </style>
        </head>
        <body>
          <div class="offline-icon">📱⚡</div>
          <h1 class="offline-title">You're Offline</h1>
          <p class="offline-message">Check your internet connection and try again.</p>
          <button onclick="window.location.reload()" style="
            background: #7C3AED; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer;
            margin-top: 20px;
          ">Retry</button>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Stale-while-revalidate strategy for other assets
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Fetch in background to update cache
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('[SW] Background fetch failed:', error);
  });

  // Return cached version immediately if available
  if (cachedResponse) {
    console.log('[SW] Serving stale content:', request.url);
    return cachedResponse;
  }

  // Wait for network if no cache
  try {
    return await networkResponsePromise;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url)) ||
         url.pathname.startsWith('/api/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'progress-sync') {
    event.waitUntil(syncProgressData());
  }
});

async function syncProgressData() {
  try {
    // Get pending progress updates from IndexedDB
    const pendingUpdates = await getPendingProgressUpdates();
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data)
        });
        
        if (response.ok) {
          await removePendingUpdate(update.id);
          console.log('[SW] Synced progress update:', update.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync update:', update.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingProgressUpdates() {
  // Implementation would use IndexedDB to get pending updates
  return [];
}

async function removePendingUpdate(id) {
  // Implementation would remove the update from IndexedDB
  console.log('[SW] Would remove pending update:', id);
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body || 'New notification from AlgoZombies',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/open.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/icons/close.png'
      }
    ],
    requireInteraction: true,
    tag: data.tag || 'default'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'AlgoZombies', options)
      .then(() => {
        console.log('[SW] Notification shown successfully');
      })
      .catch((error) => {
        console.error('[SW] Failed to show notification:', error);
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('[SW] Failed to handle notification click:', error);
      })
  );
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    console.log('[SW] Syncing content in background...');
    
    // Update lesson content
    const lessonsResponse = await fetch('/api/lessons');
    if (lessonsResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put('/api/lessons', lessonsResponse.clone());
    }
    
    // Update user progress
    const progressResponse = await fetch('/api/progress');
    if (progressResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put('/api/progress', progressResponse.clone());
    }
    
    console.log('[SW] Content sync completed');
  } catch (error) {
    console.error('[SW] Content sync failed:', error);
  }
}

console.log('[SW] Service worker loaded successfully');