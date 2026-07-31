// Runtime-caching service worker — the minimum needed to make the player installable (Chrome/Android
// require a registered SW with a fetch handler) and offline-capable for the app shell. Deliberately
// NO precache manifest: our JS/CSS are content-hashed + immutable, so cache-first on `/assets/*` +
// network-first navigations capture the whole single-screen shell as it's fetched, with nothing to
// revision across deploys — the failure mode that bricks precache SWs simply can't arise.
//
// Timing note: with the default lifecycle (no skipWaiting/claim) the SW only controls a page from
// the *next* navigation, so the shell is cached on the reload after the first visit, not the first
// paint itself. Offline therefore works from the second load onward.
//
// Brick-avoidance: navigations are network-first (a bad deploy's HTML always comes from the network
// while online), this file is served `no-cache` (see public/_headers) so a fix propagates within a
// browser's revalidation window, and the default lifecycle (no skipWaiting) avoids mid-session
// chunk swaps. If a client ever gets stuck, see wiki/runbooks/pwa-recovery.md for the self-destruct
// recovery SW.
//
// eslint-disable — service-worker globals differ from the app's; this file is not typechecked.
/* eslint-disable */
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

// Cache a response only if it's a plain `200` (not a `206` range — the Cache API rejects those — nor
// a redirect, which throws when replayed to a navigation). Fire-and-forget with a swallowed reject so
// a quota-exceeded on a constrained device never surfaces as an unhandled rejection.
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

// For mutable-but-stable assets (art, fonts, manifest, icons): always prefer the network so a
// re-extract / icon swap propagates (matching their revalidatable `_headers`), falling back to cache
// only when offline. Cache-first would freeze them until a VERSION bump — the opposite of intended.
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

  // Only same-origin GETs are ours; audio is bypassed (huge files + Range requests the Cache API
  // mishandles), and cross-origin requests pass straight through.
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
  // Only content-hashed `/assets/*` are immutable → safe to serve cache-first forever. Everything
  // else same-origin (art, fonts, manifest, icons) is network-first so updates aren't frozen.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
    return
  }
  event.respondWith(networkFirst(request))
})
