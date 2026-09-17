const CACHE_NAME = 'dotch-cache-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/icon-logo.png',
  '/full-logo.png',
  '/logo-placeholder.svg',
]

// Install: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Service Worker cache.addAll partial fail:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate: Clean up previous cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    )
  )
  self.clients.claim()
})

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests or Firebase Firestore/Auth websocket and API endpoints
  if (request.method !== 'GET') return
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('identitytoolkit.googleapis.com') ||
      url.hostname.includes('openrouter.ai') ||
      url.pathname.startsWith('/api/')) {
    return
  }

  // 1. Navigation requests (HTML pages): Network-first, fall back to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return networkResponse
        })
        .catch(() => {
          return caches.match(request).then((cached) => cached || caches.match('/index.html'))
        })
    )
    return
  }

  // 2. Static Vite bundles, CSS, JS, fonts, and icons: Cache-first
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') ||
     url.pathname.match(/\.(js|css|woff2|woff|ttf|png|svg|ico)$/))
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return networkResponse
        })
      })
    )
    return
  }

  // 3. Remote images (e.g. Unsplash images): Stale-while-revalidate
  if (url.hostname.includes('images.unsplash.com') || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
            }
            return networkResponse
          })
          .catch(() => cachedResponse)

        return cachedResponse || fetchPromise
      })
    )
    return
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
