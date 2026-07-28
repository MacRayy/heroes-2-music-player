# Support & legal chrome

> Corner fundraising widget plus a footer with Copyrights/Privacy modals, over the player.

**Where** — rendered in `App.tsx`'s `Shell`, only once `hasStarted` (after the start gate), as
fixed-position overlays outside the centered player panel.

**What users see**
- **Fundraising** (`src/components/Support.tsx`): a treasure-chest button in the bottom-right corner
  labelled "Server fundraising". Opens a modal explaining that streaming the soundtrack from a server
  costs money; a chest button ("Buy me a brick") links to `buymeacoffee.com/MacRay` in a new tab.
- **Footer** (`src/components/Footer.tsx`): three links in the bottom-left — "Copyrights & licences"
  and "Privacy policy" (each opening a modal) plus "Source" (an external link to the GitHub repo).
  Copyright text is adapted for HOMM2 (composers Paul Anthony Romero, Rob King, Steve Baca), asserts
  non-affiliation with Ubisoft, cites US fair use (17 U.S.C. § 107), and notes the code is
  MIT-licensed. Privacy text states no user data is collected by the author; the host (Cloudflare)
  may keep standard server logs.

**How it's wired**
- Both modals use the shared **`Dialog`** primitive (`src/ui/Dialog.tsx`): backdrop + framed panel +
  title + Close button + Escape-to-close. `SettingsDialog` was refactored onto it too, so all three
  modals share one skeleton (the `StartGate` overlay stays bespoke — two-step, no Close).
- The chest sprite is asset role `chest` (`OBJNRSRC.ICN` #19) → `--chest-src` token →
  `.game-button__glyph--chest`. The donate link is a plain `<a class="game-button support__donate">`
  so it inherits the button face and `:active` pressed-sprite swap.
- Styling: `.support`, `.footer`, `.dialog__scroll` in `src/components/player.css`, with narrow-
  viewport overrides in the `@media (max-width: 520px)` block.

**Specs** — no dedicated E2E; verified via Playwright screenshots during development. The `chest`
role is covered by the manifest bijection test (`src/test/art-manifest.test.ts`).
