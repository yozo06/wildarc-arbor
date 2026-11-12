import { describe, it, expect, beforeEach } from 'vitest'
import { strToU8, zipSync } from 'fflate'
import { createMemoryStore, getStore, readMeta, resetStoreForTests } from './store'
import { createSpecies, createTree, createZone } from './farm'
import { addActivity, addHealth } from './logs'
import { updateUser } from './owner'
import { exportFarm, FARM_FORMAT, FARM_VERSION, markSaved, readFarmFile } from './farmFile'

const errorOf = async (p: Promise<unknown>) => {
  try { await p } catch (e: any) { return e.response?.data?.error as string }
  throw new Error('expected a rejection')
}

const farmJson = (overrides: Record<string, unknown> = {}) => ({
  format: FARM_FORMAT, version: FARM_VERSION, savedAt: '2026-11-03T10:00:00.000Z', farm: { name: 'Test farm' },
  owner: { id: 1, name: 'You', email: '', role: 'owner', phone: null, bio: null, is_active: true, created_at: '2026-11-01T00:00:00.000Z' },
  species: [], zones: [], trees: [{ id: 1, tree_code: 'NEW-001' }], health: [], activity: [], photos: [],
  ...overrides,
})
const zipOf = (files: Record<string, Uint8Array>) => zipSync(files)
const jsonZip = (json: unknown, extra: Record<string, Uint8Array> = {}) =>
  zipOf({ 'farm.json': strToU8(JSON.stringify(json)), ...extra })

async function seedFarm() {
  const zone = await createZone({ zone_code: 'NORTH', zone_name: 'North' })
  const mango = await createSpecies({ common_name: 'Mango' })
  await createTree({ tree_code: 'T-1', zone_id: zone.id, species_id: mango.id })
  await addHealth('T-1', { health_score: 7, leaf_color: 'green' })
  await addActivity('T-1', 'watered')
  await updateUser(1, { name: 'Asha' })
  const store = await getStore()
  await store.put('photos', { id: 1, tree_code: 'T-1', photo_type: 'general', caption: null, taken_at: '2026-11-02T08:00:00.000Z', mime: 'image/jpeg', bytes: Uint8Array.of(1, 2, 3) })
  await store.put('photos', { id: 2, tree_code: 'T-1', photo_type: 'general', caption: 'bark', taken_at: '2026-11-02T09:00:00.000Z', mime: 'image/jpeg', bytes: Uint8Array.of(9, 8, 7, 6) })
}

beforeEach(() => resetStoreForTests(createMemoryStore()))

describe('exportFarm', () => {
  it('names the file by the local date, not the UTC one', async () => {
    const justAfterMidnight = new Date(2026, 10, 13, 0, 30)
    expect((await exportFarm(justAfterMidnight)).filename).toBe('arbor-farm-2026-11-13.zip')
  })

  it('names the file by date and leaves the save time to markSaved', async () => {
    await seedFarm()
    const out = await exportFarm(new Date('2026-11-12T15:30:00.000Z'))
    expect(out.filename).toBe('arbor-farm-2026-11-12.zip')
    expect(out.savedAt).toBe('2026-11-12T15:30:00.000Z')
    expect(out.blob.type).toBe('application/zip')
    // Building the zip is not saving it: the person may still cancel the share sheet.
    expect(await readMeta('lastSavedAt')).toBeUndefined()
    await markSaved(out.savedAt)
    expect(await readMeta('lastSavedAt')).toBe('2026-11-12T15:30:00.000Z')
  })

  it('round-trips the whole farm, photos byte for byte', async () => {
    await seedFarm()
    const { bytes } = await exportFarm(new Date('2026-11-12T15:30:00.000Z'))
    const before = await getStore()
    const snapshot = Object.fromEntries(await Promise.all(
      (['species', 'zones', 'trees', 'health', 'activity'] as const).map(async s => [s, await before.all(s)] as const)))

    resetStoreForTests(createMemoryStore())
    const opened = await readFarmFile(bytes)
    expect(opened.summary).toEqual({ trees: 1, photos: 2, savedAt: '2026-11-12T15:30:00.000Z' })
    await opened.apply()

    const after = await getStore()
    for (const [s, rows] of Object.entries(snapshot)) expect(await after.all(s as any)).toEqual(rows)
    const photos = (await after.all<any>('photos')).sort((a, b) => a.id - b.id)
    expect(photos.map(p => Array.from(p.bytes))).toEqual([[1, 2, 3], [9, 8, 7, 6]])
    expect(photos[1]).toMatchObject({ caption: 'bark', mime: 'image/jpeg', tree_code: 'T-1' })
    expect((await after.get<any>('meta', 'owner')).name).toBe('Asha')
    expect(await readMeta('lastSavedAt')).toBe('2026-11-12T15:30:00.000Z')
  })
})

describe('readFarmFile', () => {
  beforeEach(async () => { await createTree({ tree_code: 'OLD-001' }) })
  const oldTreeStillThere = async () =>
    expect((await (await getStore()).all<any>('trees')).map(t => t.tree_code)).toEqual(['OLD-001'])

  it('refuses a newer version and leaves the phone untouched', async () => {
    expect(await errorOf(readFarmFile(jsonZip(farmJson({ version: 2 })))))
      .toBe('This farm file was made by a newer Arbor. Update Arbor and try again.')
    await oldTreeStillThere()
  })

  it('refuses something that is not a farm file', async () => {
    expect(await errorOf(readFarmFile(zipOf({ 'notes.txt': strToU8('hi') })))).toBe('This is not an Arbor farm file.')
    expect(await errorOf(readFarmFile(strToU8('not a zip at all')))).toBe('This is not an Arbor farm file.')
    expect(await errorOf(readFarmFile(jsonZip({ format: 'something-else', version: 1 })))).toBe('This is not an Arbor farm file.')
    await oldTreeStillThere()
  })

  it('refuses a file whose listed photo is missing', async () => {
    const json = farmJson({ photos: [{ id: 1, tree_code: 'NEW-001', photo_type: 'general', caption: null, taken_at: '2026-11-03T10:00:00.000Z', mime: 'image/jpeg', file: 'photos/1.jpg' }] })
    expect(await errorOf(readFarmFile(jsonZip(json)))).toBe('This farm file is damaged and cannot be opened.')
    await oldTreeStillThere()
  })

  it('refuses records without their key', async () => {
    expect(await errorOf(readFarmFile(jsonZip(farmJson({ trees: [{ id: 1 }] })))))
      .toBe('This farm file is damaged and cannot be opened.')
    await oldTreeStillThere()
  })

  it('apply replaces everything in one go', async () => {
    const opened = await readFarmFile(jsonZip(farmJson()))
    await oldTreeStillThere()
    await opened.apply()
    expect((await (await getStore()).all<any>('trees')).map(t => t.tree_code)).toEqual(['NEW-001'])
    expect(await readMeta('lastSavedAt')).toBe('2026-11-03T10:00:00.000Z')
    expect(await readMeta('sample')).toBe(false)
    expect(await readMeta('farmName')).toBe('Test farm')
  })
})
