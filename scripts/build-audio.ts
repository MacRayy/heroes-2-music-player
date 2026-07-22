import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { TRACKS } from '../src/data/tracks'

type ManifestEntry = {
  file: string
  src: string
  durationSec: number
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '..')
const isForce = process.argv.includes('--force')

const DEFAULT_MUSIC_DIR = join(homedir(), 'Library', 'Application Support', 'fheroes2', 'music')
const musicDir = process.env.HOMM2_MUSIC_DIR ?? DEFAULT_MUSIC_DIR
const outDir = join(repoRoot, 'public', 'audio')
const manifestPath = join(repoRoot, 'src', 'data', 'audio-manifest.json')

const fail = (message: string): never => {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

const hasBinary = (bin: string): boolean => spawnSync('which', [bin]).status === 0

const probeDurationSec = (file: string): number => {
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

const transcode = (srcPath: string, outPath: string): void => {
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

const readPriorManifest = (): Record<string, Partial<ManifestEntry>> => {
  if (!existsSync(manifestPath)) {
    return {}
  }
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, Partial<ManifestEntry>>
  } catch {
    return {}
  }
}

if (!hasBinary('ffmpeg') || !hasBinary('ffprobe')) {
  fail('ffmpeg/ffprobe not found. Install them first: `brew install ffmpeg`')
}
if (!existsSync(musicDir)) {
  fail(
    `Source music dir not found: ${musicDir}\nSet HOMM2_MUSIC_DIR to your fheroes2 music folder.`,
  )
}
mkdirSync(outDir, { recursive: true })

const priorManifest = readPriorManifest()

const results = TRACKS.map((track) => {
  const srcPath = join(musicDir, `${track.src}.ogg`)
  const outPath = join(outDir, track.file)
  if (!existsSync(srcPath)) {
    fail(`missing source OGG for "${track.id}": ${srcPath}`)
  }
  const isUpToDate = existsSync(outPath) && priorManifest[track.id]?.src === track.src
  const didTranscode = isForce || !isUpToDate
  if (didTranscode) {
    transcode(srcPath, outPath)
  }
  const entry: readonly [string, ManifestEntry] = [
    track.id,
    { file: track.file, src: track.src, durationSec: probeDurationSec(outPath) },
  ]
  return { entry, didTranscode }
})

const manifest = Object.fromEntries(results.map((result) => result.entry))
const transcodedCount = results.filter((result) => result.didTranscode).length

const expectedFiles = new Set(TRACKS.map((track) => track.file))
readdirSync(outDir)
  .filter((name) => name.endsWith('.mp3') && !expectedFiles.has(name))
  .forEach((name) => {
    console.warn(`⚠ orphan MP3 not referenced by tracks.ts: ${name}`)
  })

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log(
  `✔ audio build complete — ${transcodedCount} transcoded, ${results.length - transcodedCount} up-to-date, ${results.length} tracks in manifest.`,
)
