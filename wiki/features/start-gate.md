# Start gate (fog-of-war intro)

> A HOMM3-style intro modal that reveals the map and begins playback on a horse Start button.

**Where** — `src/App.tsx` (`Shell` holds `hasStarted`), `src/components/StartGate.tsx`,
`src/components/Background.tsx`, styles in `src/components/player.css` (`.start-gate*`, `.bg--revealed`).

**What users see** — on load, an ornate panel over a **fog-of-war** background (the map darkened +
uneven radial shadow). It shows the title, "Music Player", a one-line fan-project/consent note, and a
**Start button = the game's horse glyph** (`ADVBTNS` #2, role `horse`, keyed off its button face). On
press the fog lifts, the background **unblurs** to the full clear map (`.bg` → `.bg--revealed`, 1.6 s
filter transition), the gate fades out, and playback begins.

**How it's wired** — `Shell` renders `<StartGate isOpen={!hasStarted} onStart={…}>`; `onStart` sets
`hasStarted` and calls `togglePlay()` from the player context. The Start click doubles as the browser
**autoplay gesture**, so `audio.play()` is allowed. The gate stays mounted but goes
`opacity:0; pointer-events:none` when closed (smooth fade, no unmount race). The Start button is
auto-focused for keyboard users.

**Purpose** — click-to-enter consent before the public deploy streams the copyrighted HOMM2 audio,
matching the reference site's start gate.
