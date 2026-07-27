# Start gate (fog-of-war intro)

> A HOMM3-style intro modal that reveals the map and begins playback on a horse Start button.

**Where** — `src/App.tsx` (`Shell` holds `hasStarted`), `src/components/StartGate.tsx`,
`src/components/Background.tsx`, styles in `src/components/player.css` (`.start-gate*`, `.bg--revealed`).

**What users see** — two steps:
1. A **black screen** with an ornate welcome panel — title, "Music Player", a one-line
   fan-project/consent note, and an **Okay** button.
2. Okay fades the black away, **unblurring the map** to full clarity; a compact panel appears with the
   game's **horse glyph** button (`ADVBTNS` #2, role `horse`, keyed off its button face) and the word
   **Start** beneath it. The player itself stays hidden through both steps.

Pressing the horse reveals the player and begins playback.

**How it's wired** — `Shell` holds two flags: `hasConfirmed` (Okay → `Background isRevealed`, map
unblurs via `.bg` → `.bg--revealed`, 1.4 s black fade) and `hasStarted` (horse → `togglePlay()` +
reveal the player via `.app` / `.app--hidden`). The horse click doubles as the browser **autoplay
gesture**, so `audio.play()` is allowed (the `<audio>` is a JS-created object in the hook, unaffected
by hiding the player). The gate stays mounted but goes `opacity:0; pointer-events:none` when closed.
The active step's button is auto-focused for keyboard users.

**Purpose** — click-to-enter consent before the public deploy streams the copyrighted HOMM2 audio,
matching the reference site's start gate.
