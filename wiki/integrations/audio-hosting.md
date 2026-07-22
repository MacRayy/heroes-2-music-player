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
- Prod: set to the bucket/CDN origin, e.g. `https://cdn.example.com/homm2-audio/`.

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
