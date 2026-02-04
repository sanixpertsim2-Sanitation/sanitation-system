/*
 * SANIXPERT SERVICE WORKER
 * Progressive Web App functionality
 * Offline support, caching, and background sync
 */

const CACHE_NAME = 'sanixpert-v1.0.0';
const STATIC_CACHE = 'sanixpert-static-v1.0.0';
const DYNAMIC_CACHE = 'sanixpert-dynamic-v1.0.0';
const IMAGE_CACHE = 'sanixpert-images-v1.0.0';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index-next.html',
  '/dashboard-next.html',
  '/analytics-dashboard-next.html',
  '/css/mobile-next.css',
  '/css/mobile-next-enhanced.css',
  '/js/mobile-next.js',
  '/js/mobile-next-enhanced.js',
  '/js/mobile-photo-utils.js',
  '/js/mobile-offline.js',
  '/js/mobile-analytics.js',
  '/js/supabaseClient.js',
  '/js/dateUtils.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different request types
  if (request.method === 'GET') {
    if (STATIC_FILES.includes(url.pathname) || 
        url.pathname === '/' ||
        url.pathname.endsWith('.html') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js')) {
      // Static files - use cache first strategy
      event.respondWith(cacheFirst(request));
    } else if (url.pathname.startsWith('/api/')) {
      // API calls - use network first strategy
      event.respondWith(networkFirst(request));
    } else if (url.searchParams.has('image') || 
               url.pathname.includes('photo') ||
               url.pathname.includes('upload')) {
      // Images - use cache first with expiration
      event.respondWith(cacheFirstWithExpiration(request, 24 * 60 * 60 * 1000)); // 24 hours
    } else {
      // Dynamic content - use network first strategy
      event.respondWith(networkFirst(request));
    }
  } else if (request.method === 'POST') {
    // Handle POST requests (form submissions, photo uploads)
    event.respondWith(handlePostRequest(request));
  }
});

// Cache first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('📦 Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('🌐 Cached new resource:', request.url);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('❌ Cache first failed:', error);
    
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/index-next.html');
    }
    
    throw error;
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('🌐 Network response cached:', request.url);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('📱 Network failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/index-next.html');
    }
    
    throw error;
  }
}

// Cache first with expiration
async function cacheFirstWithExpiration(request, maxAge) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Check if cache is expired
      const dateHeader = cachedResponse.headers.get('date');
      if (dateHeader) {
        const cacheTime = new Date(dateHeader).getTime();
        const now = Date.now();
        
        if (now - cacheTime < maxAge) {
          console.log('📦 Serving fresh cache:', request.url);
          return cachedResponse;
        } else {
          console.log('⏰ Cache expired, fetching fresh:', request.url);
          // Delete expired cache
          caches.delete(request);
        }
      }
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      // Add date header for expiration tracking
      const responseToCache = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...networkResponse.headers,
          'date': new Date().toUTCString()
        }
      });
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('❌ Cache with expiration failed:', error);
    
    // Return cached version even if expired
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Handle POST requests (background sync)
async function handlePostRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request.clone());
    
    if (networkResponse.ok) {
      console.log('✅ POST request successful:', request.url);
      return networkResponse;
    }
    
    throw new Error('Network request failed');
    
  } catch (error) {
    console.log('📱 Network failed, queuing for background sync:', request.url);
    
    // Store request for background sync
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      timestamp: Date.now()
    };
    
    // Store in IndexedDB for background sync
    await storeForBackgroundSync(requestData);
    
    // Return success response to user
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Request queued for background sync',
        offline: true 
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Store request for background sync
async function storeForBackgroundSync(requestData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sanixpert-background-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['sync-queue'], 'readwrite');
      const store = transaction.objectStore('sync-queue');
      
      const addRequest = store.add(requestData);
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { autoIncrement: true });
      }
    };
  });
}

// Background sync
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(processBackgroundSync());
  }
});

// Process background sync queue
async function processBackgroundSync() {
  try {
    const db = await openSyncDatabase();
    const transaction = db.transaction(['sync-queue'], 'readwrite');
    const store = transaction.objectStore('sync-queue');
    
    const requests = await store.getAll();
    
    for (const requestData of requests) {
      try {
        // Retry the request
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });
        
        if (response.ok) {
          // Remove from queue on success
          await store.delete(requestData.id);
          console.log('✅ Background sync successful:', requestData.url);
        } else {
          console.log('⚠️ Background sync failed, keeping in queue:', requestData.url);
        }
        
      } catch (error) {
        console.error('❌ Background sync error:', error);
      }
    }
    
  } catch (error) {
    console.error('❌ Background sync processing failed:', error);
  }
}

// Open sync database
function openSyncDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sanixpert-background-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { autoIncrement: true });
      }
    };
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received:', event);
  
  const options = {
    body: 'New sanitation task assigned',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'sanixpert-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Task'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Sanixpert', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app to the relevant page
    event.waitUntil(
      clients.openWindow('/dashboard-next.html')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    event.waitUntil(Promise.resolve());
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll()
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes('sanixpert') && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/dashboard-next.html');
          }
        })
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync triggered:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Sync data in background
      syncApplicationData()
    );
  }
});

// Sync application data
async function syncApplicationData() {
  try {
    // This would sync data with your backend
    console.log('🔄 Syncing application data...');
    
    // Example: Sync analytics data
    const analyticsData = await getStoredAnalyticsData();
    if (analyticsData.length > 0) {
      await fetch('/api/analytics/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData)
      });
    }
    
    console.log('✅ Application data synced successfully');
    
  } catch (error) {
    console.error('❌ Application data sync failed:', error);
  }
}

// Get stored analytics data
async function getStoredAnalyticsData() {
  // This would retrieve stored analytics data from IndexedDB
  return [];
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('📨 Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CACHE_UPDATE') {
    // Update specific cache
    updateCache(event.data.url);
  } else if (event.data.type === 'CLEAR_CACHE') {
    // Clear all caches
    clearAllCaches();
  }
});

// Update specific cache
async function updateCache(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(url, response);
      console.log('🔄 Cache updated:', url);
    }
  } catch (error) {
    console.error('❌ Cache update failed:', error);
  }
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('🗑️ All caches cleared');
  } catch (error) {
    console.error('❌ Cache clearing failed:', error);
  }
}

// Cleanup old caches periodically
self.addEventListener('activate', (event) => {
  event.waitUntil(
    cleanupOldCaches()
  );
});

async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      name !== STATIC_CACHE && 
      name !== DYNAMIC_CACHE && 
      name !== IMAGE_CACHE
    );
    
    await Promise.all(
      oldCaches.map(cacheName => caches.delete(cacheName))
    );
    
    if (oldCaches.length > 0) {
      console.log('🗑️ Cleaned up old caches:', oldCaches);
    }
    
  } catch (error) {
    console.error('❌ Cache cleanup failed:', error);
  }
}

console.log('🚀 Sanixpert Service Worker loaded');
