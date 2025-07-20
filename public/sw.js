// Service Worker for Fragransia™ - Offline PWA Functionality
const CACHE_NAME = 'fragransia-v1.0.0'
const STATIC_CACHE = 'fragransia-static-v1.0.0'
const DYNAMIC_CACHE = 'fragransia-dynamic-v1.0.0'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/products',
  '/about',
  '/contact',
  '/cart',
  '/manifest.json',
  '/favicon.ico',
  '/images/hero-perfume.jpeg',
  '/images/promo-banner.jpeg',
  '/images/api-endpoints.jpeg'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/health-check/,
  /fragransia\.onrender\.com\/api/
]

// Mock API responses for offline mode
const MOCK_RESPONSES = {
  '/products': {
    success: true,
    data: {
      products: [
        {
          id: "1",
          name: "FRAGRANSIA PERFUME",
          price: 1099,
          originalPrice: 1099,
          size: "100ml",
          image: "/images/IMG-20250712-WA0027.jpg",
          category: "woody",
          rating: 4.8,
          reviews: 127,
          discount: 0,
          description: "A sophisticated woody aromatic fragrance with notes of bergamot, cedar, and amber. Long lasting upto 6-8h.",
          stock: 25,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "FRAGRANSIA PERFUME",
          price: 1099,
          originalPrice: 1099,
          size: "100ml",
          image: "/images/IMG-20250712-WA0027.jpg",
          category: "oriental",
          rating: 4.6,
          reviews: 89,
          discount: 0,
          description: "An opulent oriental fragrance inspired by Italian luxury and craftsmanship. Long lasting upto 6-8h.",
          stock: 18,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      total: 8
    }
  },
  '/health-check': {
    success: true,
    status: 'offline-mode',
    message: 'Service worker providing offline functionality'
  }
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated successfully')
        return self.clients.claim()
      })
  )
})

// Fetch event - intercept network requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return handleNonGetRequest(event)
  }

  // Handle different types of requests
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request))
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request))
  } else if (isPageRequest(url)) {
    event.respondWith(handlePageRequest(request))
  } else {
    event.respondWith(handleOtherRequest(request))
  }
})

// Check if request is for API
function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || 
         API_CACHE_PATTERNS.some(pattern => pattern.test(url.href))
}

// Check if request is for static asset
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
}

// Check if request is for a page
function isPageRequest(url) {
  return url.pathname.startsWith('/') && !url.pathname.includes('.')
}

// Handle API requests with fallback
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    throw new Error('Network response not ok')
  } catch (error) {
    console.log('Service Worker: Network failed for API request, trying cache or mock')
    
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      console.log('Service Worker: Serving API response from cache')
      return cachedResponse
    }
    
    // Fallback to mock responses
    const mockResponse = getMockResponse(url.pathname)
    if (mockResponse) {
      console.log('Service Worker: Serving mock API response')
      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-Served-By': 'ServiceWorker-Mock'
        }
      })
    }
    
    // Return error response
    return new Response(JSON.stringify({
      success: false,
      error: 'Service unavailable',
      message: 'API is currently offline'
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Try network
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache the asset
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Failed to load static asset:', request.url)
    
    // Return placeholder for images
    if (request.url.includes('placeholder.svg')) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="#f0f0f0"/><text x="150" y="200" text-anchor="middle" fill="#999">Image Unavailable</text></svg>',
        {
          status: 200,
          headers: { 'Content-Type': 'image/svg+xml' }
        }
      )
    }
    
    return new Response('Asset not available offline', { status: 404 })
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache the page
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    throw new Error('Network response not ok')
  } catch (error) {
    console.log('Service Worker: Network failed for page request, trying cache')
    
    // Try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback to offline page
    const offlinePage = await caches.match('/')
    if (offlinePage) {
      return offlinePage
    }
    
    // Last resort - basic offline message
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fragransia™ - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline-message { max-width: 500px; margin: 0 auto; }
            .logo { font-size: 2em; font-weight: bold; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <div class="logo">FRAGRANSIA™</div>
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Handle other requests
async function handleOtherRequest(request) {
  try {
    return await fetch(request)
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Not available offline', { status: 404 })
  }
}

// Handle non-GET requests (POST, PUT, DELETE, etc.)
function handleNonGetRequest(event) {
  const { request } = event
  
  // For API requests, try to store them for later sync
  if (isApiRequest(new URL(request.url))) {
    event.respondWith(handleOfflineApiMutation(request))
  } else {
    // Let other non-GET requests pass through
    event.respondWith(fetch(request))
  }
}

// Handle API mutations when offline
async function handleOfflineApiMutation(request) {
  try {
    // Try network first
    const response = await fetch(request)
    return response
  } catch (error) {
    // Store the request for later sync
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      timestamp: Date.now()
    }
    
    // Store in IndexedDB for sync later
    await storeOfflineRequest(requestData)
    
    // Return a response indicating the request was queued
    return new Response(JSON.stringify({
      success: true,
      message: 'Request queued for sync when online',
      queued: true
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Store offline requests for later sync
async function storeOfflineRequest(requestData) {
  try {
    // Open IndexedDB
    const db = await openDB()
    const transaction = db.transaction(['offlineRequests'], 'readwrite')
    const store = transaction.objectStore('offlineRequests')
    
    await store.add({
      id: Date.now() + Math.random(),
      ...requestData
    })
    
    console.log('Service Worker: Stored offline request for sync')
  } catch (error) {
    console.error('Service Worker: Failed to store offline request:', error)
  }
}

// Open IndexedDB for offline requests
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FragransiaOfflineDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('offlineRequests')) {
        db.createObjectStore('offlineRequests', { keyPath: 'id' })
      }
    }
  })
}

// Get mock response for API endpoint
function getMockResponse(pathname) {
  // Exact match
  if (MOCK_RESPONSES[pathname]) {
    return MOCK_RESPONSES[pathname]
  }
  
  // Pattern matching
  if (pathname.startsWith('/products/')) {
    const productId = pathname.split('/').pop()
    const product = MOCK_RESPONSES['/products'].data.products.find(p => p.id === productId)
    
    if (product) {
      return { success: true, data: product }
    }
  }
  
  return null
}

// Background sync for offline requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineRequests())
  }
})

// Sync offline requests when back online
async function syncOfflineRequests() {
  try {
    const db = await openDB()
    const transaction = db.transaction(['offlineRequests'], 'readonly')
    const store = transaction.objectStore('offlineRequests')
    const requests = await store.getAll()
    
    for (const requestData of requests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        })
        
        if (response.ok) {
          // Remove successfully synced request
          const deleteTransaction = db.transaction(['offlineRequests'], 'readwrite')
          const deleteStore = deleteTransaction.objectStore('offlineRequests')
          await deleteStore.delete(requestData.id)
          
          console.log('Service Worker: Synced offline request:', requestData.url)
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync request:', error)
      }
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync offline requests:', error)
  }
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then(cache => cache.addAll(event.data.urls))
    )
  }
})

// Notify clients when service worker is ready
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          message: 'Service Worker activated successfully'
        })
      })
    })
  )
})

console.log('Service Worker: Loaded successfully')

