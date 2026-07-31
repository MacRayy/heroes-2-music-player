# Recovering a broken service worker

> When a shipped `sw.js` bug white-screens returning users, deploy a self-destruct SW to clear it —
> the client-side analogue of a CDN purge, because a SW can't be edge-purged.

## Trigger

Returning users (not first-time visitors) see a blank page / stale app after a deploy, and DevTools
→ Application → Service Workers shows an old worker controlling the page. A hard refresh doesn't fix
it for them because the SW intercepts the fetch.

## Steps

1. **Confirm it's the SW**, not the edge. In DevTools → Application → Service Workers, unregister +
   reload — if that fixes it, the SW is the culprit. (An edge issue is fixed by `yarn deploy`'s
   `purge_everything`; see [[deploy-cloudflare]].)
2. **Verify the recovery channel is open.** `curl -sI https://homm2musicplayer.com/sw.js | grep -i cache-control`
   must show `max-age=0, must-revalidate`. If it's `immutable` or long-lived, the fix below can't
   reach clients — fix `public/_headers` first and redeploy.
3. **Replace `public/sw.js` with the self-destruct worker** and deploy. Unlike the normal SW, this
   one uses `skipWaiting()` + `clients.claim()` so it activates immediately on the next revalidation
   without waiting for every tab to close:

   ```js
   self.addEventListener('install', () => self.skipWaiting())
   self.addEventListener('activate', (event) => {
     event.waitUntil(
       (async () => {
         const keys = await caches.keys()
         await Promise.all(keys.map((k) => caches.delete(k)))
         await self.registration.unregister()
         const clients = await self.clients.matchAll({ type: 'window' })
         clients.forEach((c) => c.navigate(c.url))
       })(),
     )
   })
   ```

4. `yarn deploy` (builds, deploys, purges the edge). The browser revalidates the `no-cache` `sw.js`
   within its window, installs the self-destruct worker, wipes caches, unregisters, and reloads each
   window onto the plain network.
5. **Belt-and-suspenders**: if a user never re-navigates, tell them to **close all tabs** of the site
   (not just reload) — that forces the new worker to activate.
6. Once clients have recovered, restore the fixed normal `public/sw.js` and deploy again.

## Verification

- DevTools → Application → Service Workers shows no controlling worker (or the fixed one), Cache
  Storage is empty of the stale `h2mp-shell-*` entries, and the app loads from the network.
- `curl -sI .../sw.js` still shows `max-age=0, must-revalidate`.

## Related

- [[2026-07-31-pwa]] (why the SW is hand-rolled + the `no-cache` invariant), [[deploy-cloudflare]]
  (the edge-purge counterpart), [[pwa]].
