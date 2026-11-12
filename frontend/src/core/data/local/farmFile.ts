import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from 'fflate'
import { getStore, writeMeta, type StoreName } from './store'
import { fail } from './errors'
import { getOwner, type LocalOwner } from './owner'

// The farm file: one zip holding farm.json and every photo as a JPEG under photos/. It is the one thing people
// keep, so it carries a version number, and every later Arbor must still open version 1.

export const FARM_FORMAT = 'arbor-farm'
export const FARM_VERSION = 1

const NOT_A_FARM = 'This is not an Arbor farm file.'
const NEWER = 'This farm file was made by a newer Arbor. Update Arbor and try again.'
const DAMAGED = 'This farm file is damaged and cannot be opened.'

type Row = Record<string, any>

export interface FarmPhoto {
  id: number
  tree_code: string
  photo_type: string
  caption: string | null
  taken_at: string
  mime: string
  file: string
}

export interface FarmData {
  format: typeof FARM_FORMAT
  version: typeof FARM_VERSION
  savedAt: string
  farm: { name: string }
  owner: LocalOwner
  species: Row[]
  zones: Row[]
  trees: Row[]
  health: Row[]
  activity: Row[]
  photos: FarmPhoto[]
}

const RECORDS = ['species', 'zones', 'trees', 'health', 'activity'] as const

async function toBytes(input: Blob | ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  if (input instanceof Uint8Array) return input
  if (input instanceof ArrayBuffer) return new Uint8Array(input)
  if (typeof (input as Blob).arrayBuffer === 'function') return new Uint8Array(await (input as Blob).arrayBuffer())
  return fail(400, NOT_A_FARM)
}

/** Checks a farm.json completely before anything on the phone is touched. */
export function validateFarmData(json: unknown): FarmData {
  const d = json as Row
  if (!d || typeof d !== 'object' || d.format !== FARM_FORMAT || typeof d.version !== 'number' || d.version < 1) {
    fail(400, NOT_A_FARM)
  }
  if (d.version > FARM_VERSION) fail(400, NEWER)
  const lists = [...RECORDS, 'photos'] as const
  if (typeof d.savedAt !== 'string' || lists.some(k => !Array.isArray(d[k]))) fail(400, DAMAGED)
  if (d.trees.some((t: Row) => typeof t?.tree_code !== 'string' || !t.tree_code)) fail(400, DAMAGED)
  for (const k of ['species', 'zones', 'health', 'activity', 'photos'] as const) {
    if (d[k].some((r: Row) => typeof r?.id !== 'number')) fail(400, DAMAGED)
  }
  if (d.photos.some((p: Row) => typeof p.file !== 'string')) fail(400, DAMAGED)
  return {
    ...(d as FarmData),
    farm: { name: typeof d.farm?.name === 'string' ? d.farm.name : 'My farm' },
  }
}

/** Builds the zip of everything on the phone and remembers when the farm was last saved. */
export async function exportFarm(now = new Date()): Promise<{ blob: Blob; bytes: Uint8Array; filename: string }> {
  const store = await getStore()
  const savedAt = now.toISOString()
  const data: Row = { format: FARM_FORMAT, version: FARM_VERSION, savedAt }
  data.farm = { name: (await store.get<Row>('meta', 'farmName'))?.value ?? 'My farm' }
  data.owner = await getOwner()
  for (const s of RECORDS) data[s] = await store.all<Row>(s)

  const files: Zippable = {}
  data.photos = (await store.all<Row>('photos')).map(({ bytes, ...photo }) => {
    const file = `photos/${photo.id}.jpg`
    files[file] = [bytes as Uint8Array, { level: 0 }] // JPEGs are already compressed
    return { ...photo, file }
  })
  files['farm.json'] = [strToU8(JSON.stringify(data)), { level: 6 }]

  const bytes = zipSync(files)
  await writeMeta('lastSavedAt', savedAt)
  return {
    blob: new Blob([bytes], { type: 'application/zip' }),
    bytes,
    filename: `arbor-farm-${savedAt.slice(0, 10)}.zip`,
  }
}

/**
 * Reads and checks a farm file. Nothing on the phone changes until `apply` is called, and `apply` replaces the
 * whole farm in one go.
 */
export async function readFarmFile(input: Blob | ArrayBuffer | Uint8Array) {
  const bytes = await toBytes(input)
  let files: Record<string, Uint8Array>
  let json: unknown
  try {
    files = unzipSync(bytes)
    json = JSON.parse(strFromU8(files['farm.json']))
  } catch {
    return fail(400, NOT_A_FARM)
  }
  const data = validateFarmData(json)
  const photos = data.photos.map(({ file, ...photo }) => {
    const photoBytes = files[file] ?? fail(400, DAMAGED)
    return { ...photo, bytes: photoBytes }
  })

  return {
    summary: { trees: data.trees.length, photos: photos.length, savedAt: data.savedAt },
    apply: () => replaceFarm(data, photos, { sample: false, lastSavedAt: data.savedAt, startedAt: data.savedAt }),
  }
}

/** Puts a checked farm on the phone in place of whatever is there, in one transaction. */
export async function replaceFarm(
  data: FarmData,
  photos: Row[],
  flags: { sample: boolean; lastSavedAt?: string; startedAt: string },
): Promise<void> {
  const replacement: Partial<Record<StoreName, unknown[]>> = { photos }
  for (const s of RECORDS) replacement[s] = data[s]
  replacement.meta = [
    { key: 'owner', ...data.owner },
    { key: 'farmName', value: data.farm.name },
    { key: 'startedAt', value: flags.startedAt },
    { key: 'sample', value: flags.sample },
    ...(flags.lastSavedAt ? [{ key: 'lastSavedAt', value: flags.lastSavedAt }] : []),
  ]
  await (await getStore()).replaceAll(replacement)
}
