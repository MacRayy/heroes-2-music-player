// AGG archive reader (record table) — shared by the art/font extractors.
// Ported from fheroes2 (GPL): src/engine/agg_file.cpp. Uses Node Buffer/fs, so this stays out of
// the pure, app-importable ./icn.ts.
import { readFileSync } from 'node:fs'

export type AggRecord = { offset: number; size: number }

export type Agg = { data: Buffer; records: Map<string, AggRecord> }

/** Header: uint16 count, count×12 FAT {hash,offset,size} LE, count×15 name table at EOF. */
export const openAgg = (path: string): Agg => {
  const data = readFileSync(path)
  const count = data.readUInt16LE(0)
  const nameStart = data.length - 15 * count
  const records = new Map<string, AggRecord>()
  for (let i = 0; i < count; i += 1) {
    const rawName = data.subarray(nameStart + i * 15, nameStart + i * 15 + 15)
    const nulPos = rawName.indexOf(0)
    const name = rawName.toString('latin1', 0, nulPos === -1 ? 15 : nulPos)
    const fat = 2 + i * 12
    records.set(name, { offset: data.readUInt32LE(fat + 4), size: data.readUInt32LE(fat + 8) })
  }
  return { data, records }
}
