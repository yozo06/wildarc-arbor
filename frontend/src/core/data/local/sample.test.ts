import { describe, it, expect, beforeEach } from 'vitest'
import sample from './sample-farm.json'
import { createMemoryStore, getStore, readMeta, resetStoreForTests, STORE_NAMES } from './store'
import { validateFarmData } from './farmFile'
import { createTree, getMapTrees, getZones } from './farm'
import { updateUser } from './owner'
import { clearFarm, isSampleLoaded, loadSampleFarm } from './sample'

type Pt = [number, number]
function inside([x, y]: Pt, poly: Pt[]): boolean {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

beforeEach(() => resetStoreForTests(createMemoryStore()))

describe('the sample farm file', () => {
  const data = validateFarmData(sample)

  it('is a valid farm file of the expected size', () => {
    expect(data.trees).toHaveLength(40)
    expect(data.zones).toHaveLength(5)
    expect(data.species).toHaveLength(12)
    expect(data.health).toHaveLength(15)
    expect(data.activity).toHaveLength(20)
    expect(data.photos).toEqual([])
  })

  it('is labelled as made up', () => {
    expect(data.farm.name).toBe('Sample Food Forest')
    const zoneCode = new Map(data.zones.map(z => [z.id, z.zone_code]))
    for (const t of data.trees) expect(t.tree_code.startsWith(`${zoneCode.get(t.zone_id)}-`)).toBe(true)
  })

  it('gives a named tree the species its name says', () => {
    const speciesName = new Map(data.species.map(s => [s.id, s.common_name.toLowerCase()]))
    const named = data.trees.filter(t => t.custom_common_name)
    expect(named.length).toBeGreaterThan(0)
    for (const t of named) expect(t.custom_common_name.toLowerCase()).toContain(speciesName.get(t.species_id))
  })

  it('puts every tree inside its zone', () => {
    const outline = new Map(data.zones.map(z => [z.id, z.boundary_coords as Pt[]]))
    for (const t of data.trees) expect(inside([t.coord_x, t.coord_y], outline.get(t.zone_id)!)).toBe(true)
  })

  it('uses only the choices the screens offer', () => {
    for (const t of data.trees) {
      expect(['pending', 'cut', 'trim', 'keep', 'monitor', 'treat', 'replant']).toContain(t.action)
      expect(['pending', 'in_progress', 'completed', 'on_hold']).toContain(t.status)
      expect(['low', 'medium', 'high', 'urgent']).toContain(t.priority)
      expect(t.health_score).toBeGreaterThanOrEqual(1)
      expect(t.health_score).toBeLessThanOrEqual(10)
    }
  })
})

describe('loading and clearing', () => {
  it('loads the sample, which the map can plot in full', async () => {
    await loadSampleFarm()
    expect(await isSampleLoaded()).toBe(true)
    expect(await readMeta('farmName')).toBe('Sample Food Forest')
    expect(await readMeta('lastSavedAt')).toBeUndefined()
    const trees = await getMapTrees()
    expect(trees).toHaveLength(40)
    expect(trees.every((t: any) => t.coord_x !== null && t.coord_y !== null && t.zone_code)).toBe(true)
    expect((await getZones()).reduce((n: number, z: any) => n + z.total_trees, 0)).toBe(40)
  })

  it('clearFarm empties every store, resets the sample flag and keeps the person', async () => {
    await updateUser(1, { name: 'Asha' })
    await loadSampleFarm()
    await clearFarm()
    const store = await getStore()
    for (const s of STORE_NAMES.filter(s => s !== 'meta')) expect(await store.all(s)).toEqual([])
    expect(await isSampleLoaded()).toBe(false)
    expect((await store.get<any>('meta', 'owner')).name).toBe('Asha')
  })

  it('new trees get fresh ids after the sample is loaded', async () => {
    await loadSampleFarm()
    const t = await createTree({ tree_code: 'NEW-001' })
    const ids = (await (await getStore()).all<any>('trees')).map(r => r.id)
    expect(t.id).toBe(41)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
