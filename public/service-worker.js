const CACHE_NAME = 'mindup-pwa-v2'
const APP_SHELL = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(event.request.url)

  if (requestUrl.origin !== self.location.origin) {
    return
  }

  if (requestUrl.pathname.startsWith('/api/')) {
    return
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseCopy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/', responseCopy))
          return response
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match('/')),
        ),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) =>
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseCopy = response.clone()
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseCopy))
          }

          return response
        })
        .catch(() => cached),
    ),
  )
})
