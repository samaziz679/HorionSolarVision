// Service Worker for Solar Vision ERP PWA
const CACHE_NAME = "solar-vision-erp-v1"
const RUNTIME_CACHE = "solar-vision-runtime-v1"

// Assets to cache on install
const PRECACHE_ASSETS = ["/", "/dashboard", "/sales/new", "/inventory", "/offline"]

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Precaching assets")
      return cache.addAll(PRECACHE_ASSETS)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name)
            return caches.delete(name)
          }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Skip API requests for now (they need network)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: "Offline - API unavailable" }), {
          headers: { "Content-Type": "application/json" },
          status: 503,
        })
      }),
    )
    return
  }

  // Network first strategy for pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone()
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache)
        })
        return response
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // If not in cache, return offline page
          return caches.match("/offline")
        })
      }),
  )
})

// Background sync for offline sales
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-sales") {
    console.log("[SW] Syncing offline sales...")
    event.waitUntil(syncOfflineSales())
  }
})

async function syncOfflineSales() {
  // This will be called when the device comes back online
  // You can implement logic to sync offline sales data here
  console.log("[SW] Offline sales sync completed")
}

// Push notifications (for future use)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || "Solar Vision ERP"
  const options = {
    body: data.body || "Nouvelle notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: data.url,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data || "/dashboard"))
})
