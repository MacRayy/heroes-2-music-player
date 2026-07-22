/**
 * Transcode the in-scope HOMM2 soundtrack (OGG → MP3) and emit a committed manifest.
 *
 *   yarn build:audio            # transcode missing tracks, refresh manifest
 *   yarn build:audio --force    # re-transcode everything
 *
 * Source OGGs come from a local fheroes2 install (override with HOMM2_MUSIC_DIR).
 * MP3s are written to public/audio/ (gitignored); durations are probed with ffprobe and
 * written to src/data/audio-manifest.json (committed, prettier-conformant).
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { TRACKS } from '../src/data/tracks'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '..')
const force = process.argv.includes('--force')

const DEFAULT_MUSIC_DIR = join(homedir(), 'Library', 'Application Support', 'fheroes2', 'music')
const musicDir = process.env.HOMM2_MUSIC_DIR ?? DEFAULT_MUSIC_DIR
const outDir = join(repoRoot, 'public', 'audio')
const manifestPath = join(repoRoot, 'src', 'data', 'audio-manifest.json')

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

function hasBinary(bin: string): boolean {
  return spawnSync('which', [bin]).status === 0
}

function probeDurationSec(file: string): number {
  const result = spawnSync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    file,
  ])
  if (result.status !== 0) {
    fail(`ffprobe failed for ${file}: ${result.stderr.toString()}`)
  }
  const seconds = Number.parseFloat(result.stdout.toString().trim())
  if (Number.isNaN(seconds)) {
    fail(`could not parse duration for ${file}`)
  }
  return Math.round(seconds)
}

function transcode(srcPath: string, outPath: string): void {
  const result = spawnSync('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    srcPath,
    '-codec:a',
    'libmp3lame',
    '-q:a',
    '4',
    outPath,
  ])
  if (result.status !== 0) {
    fail(`ffmpeg failed for ${srcPath}: ${result.stderr.toString()}`)
  }
}

// --- preconditions -------------------------------------------------------
if (!hasBinary('ffmpeg') || !hasBinary('ffprobe')) {
  fail('ffmpeg/ffprobe not found. Install them first: `brew install ffmpeg`')
}
if (!existsSync(musicDir)) {
  fail(
    `Source music dir not found: ${musicDir}\n` +
      'Set HOMM2_MUSIC_DIR to your fheroes2 music folder.',
  )
}
mkdirSync(outDir, { recursive: true })

// --- transcode + probe ---------------------------------------------------
interface ManifestEntry {
  file: string
  src: string
  durationSec: number
}

// Prior manifest lets us re-transcode when a track's `src` is repointed to a different OGG
// even though its output filename is unchanged (otherwise a non-`--force` run would keep stale audio).
let priorManifest: Record<string, Partial<ManifestEntry>> = {}
if (existsSync(manifestPath)) {
  try {
    priorManifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<
      string,
      Partial<ManifestEntry>
    >
  } catch {
    priorManifest = {}
  }
}

const manifest: Record<string, ManifestEntry> = {}
let transcoded = 0
let skipped = 0

for (const track of TRACKS) {
  const srcPath = join(musicDir, `${track.src}.ogg`)
  const outPath = join(outDir, track.file)
  if (!existsSync(srcPath)) {
    fail(`missing source OGG for "${track.id}": ${srcPath}`)
  }
  const upToDate = existsSync(outPath) && priorManifest[track.id]?.src === track.src
  if (force || !upToDate) {
    transcode(srcPath, outPath)
    transcoded += 1
  } else {
    skipped += 1
  }
  manifest[track.id] = { file: track.file, src: track.src, durationSec: probeDurationSec(outPath) }
}

// --- warn about orphan MP3s not referenced by tracks.ts ------------------
const expectedFiles = new Set(TRACKS.map((t) => t.file))
for (const name of readdirSync(outDir)) {
  if (name.endsWith('.mp3') && !expectedFiles.has(name)) {
    console.warn(`⚠ orphan MP3 not referenced by tracks.ts: ${name}`)
  }
}

// --- write committed manifest (prettier-conformant: 2-space + trailing NL) --
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log(
  `✔ audio build complete — ${transcoded} transcoded, ${skipped} up-to-date, ` +
    `${Object.keys(manifest).length} tracks in manifest.`,
)
