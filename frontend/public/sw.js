const CACHE_NAME = 'raksha-path-offline-v1';
const CRITICAL_ASSETS = [
  '/',
  '/offline',
  '/logo.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(CRITICAL_ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Exclude API calls and map tiles from aggressive caching, but cache static assets
  if (event.request.url.includes('/api/')) {
    return; // Let API calls bypass the service worker
  }
  
  if (event.request.url.includes('api.tomtom.com/map')) {
    // Cache map tiles for offline viewing if possible
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response; // Return cached tile
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          let responseToCache = networkResponse.clone();
          caches.open('raksha-maps-cache').then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default Network-first approach with fallback to cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        // If it's a page navigation request, return a generic offline page or root
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, 'raksha-maps-cache'];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
