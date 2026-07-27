# Audio hosting (`VITE_AUDIO_BASE_URL`)

> Where the transcoded MP3s are served from — local `/audio/` in dev, an object store/CDN in prod.

**What we use it for** — every track's playable URL. `resolveAudioUrl(file)` in
`src/data/manifest.ts` builds it as `joinUrl(VITE_AUDIO_BASE_URL ?? '/audio/', file)`.

**Contract**
- The base must serve each manifest `file` (e.g. `town-knight.mp3`) as an MP3 with
  `Content-Type: audio/mpeg` and support HTTP range requests (for seeking).
- Files are flat (no per-category subfolders): `<base>/<file>`.
- `joinUrl` normalizes slashes, so the base may or may not end in `/`.
- Dev: unset → Vite serves `public/audio/*.mp3` at `/audio/`.
- Prod (Sevalla): set to the object-storage bucket origin with a **versioned prefix**, e.g.
  `https://<bucket-host>/homm2-audio/v1/`.

**Caching (bandwidth — the whole reason the free tier lasts)**
- The audio is the heavy payload, so the bucket objects must be served with
  `Cache-Control: public, max-age=31536000, immutable` so returning listeners re-download nothing.
- On Sevalla the audio lives in the **bucket, not the static site**, so this header is **per-object
  metadata set at upload time** (S3/R2 `CacheControl`) — the static site's `public/_headers` file
  does NOT reach the bucket's domain.
- `immutable` is only safe because the prefix is versioned: re-transcoding a track under the same
  filename means bumping `v1` → `v2` (see the relabel caveat below), which changes the URL and
  bypasses every cache cleanly.
- The static site's own assets are cached via `public/_headers` (copied to `dist/`): hashed
  `/assets/*` + `/fonts/*` immutable-forever, `/art/*` 7 days (re-extractable), `index.html`
  always-revalidate. Sevalla static hosting is Cloudflare-Pages-backed, which honors `_headers`.

**Auth & config** — public read-only bucket; no credentials in the client. Set
`VITE_AUDIO_BASE_URL` at build time (Vite inlines `import.meta.env.*`). See `.env.example`.

**Gotchas**
- **CORS:** a cross-origin base must send `Access-Control-Allow-Origin` or the `<audio>` element
  will fail to load. Same-origin (`/audio/`) has no CORS.
- MP3 (not OGG) is mandatory — Safari can't decode OGG Vorbis. See [[2026-07-22-audio-pipeline]].
- The ~52 MB of MP3s are gitignored; uploading them to the bucket is a separate deploy step
  (deferred — see `backlog.md`).
- **Relabel/re-record caveat:** if a track's `src` is repointed to a different recording while its
  output `file` name stays the same, `yarn build:audio` re-transcodes automatically (it compares the
  manifest's recorded `src`). But the bucket/CDN will keep serving the old bytes under that filename
  until you re-upload and bust the CDN/browser cache. Treat same-name content changes as needing a
  forced re-upload + cache invalidation.
