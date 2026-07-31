// Runtime-caching service worker: installable + offline app shell. No precache by design (hashed
// immutable assets ⇒ nothing to revision); served no-cache via public/_headers so a bad SW stays
// recoverable — it can't be edge-purged. See wiki/features/pwa.md + runbooks/pwa-recovery.md.
/// <reference lib="webworker" />

const VERSION = 'v1'
const CACHE = `h2mp-shell-${VERSION}`
const SHELL_URL = '/'

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    })(),
  )
})

// Plain `200` only: the Cache API rejects `206` ranges, and a cached redirect throws when replayed
// to a navigation. Reject swallowed so a quota-exceeded isn't an unhandled rejection.
const cachePut = async (key, response) => {
  if (response.status === 200 && !response.redirected) {
    const cache = await caches.open(CACHE)
    await cache.put(key, response.clone()).catch(() => undefined)
  }
}

const cacheFirst = async (request) => {
  const cached = await caches.match(request)
  if (cached !== undefined) {
    return cached
  }
  const response = await fetch(request)
  await cachePut(request, response)
  return response
}

const networkFirstNavigation = async (request) => {
  try {
    const response = await fetch(request)
    await cachePut(SHELL_URL, response)
    return response
  } catch (error) {
    const cached = await caches.match(SHELL_URL)
    if (cached !== undefined) {
      return cached
    }
    throw error
  }
}

// Art/fonts/manifest/icons: network wins so a re-extract propagates (cache-first would freeze them
// until a VERSION bump); cache is only the offline fallback.
const networkFirst = async (request) => {
  try {
    const response = await fetch(request)
    await cachePut(request, response)
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached !== undefined) {
      return cached
    }
    throw error
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ours = same-origin GET only; audio bypassed (large + Range requests the Cache API mishandles).
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }
  if (url.pathname.startsWith('/audio/')) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }
  // Only immutable hashed `/assets/*` is safe cache-first; everything else network-first.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
    return
  }
  event.respondWith(networkFirst(request))
})
