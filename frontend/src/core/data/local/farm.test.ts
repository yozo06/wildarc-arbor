import { describe, it, expect, beforeEach } from 'vitest'
import { createMemoryStore, getStore, resetStoreForTests } from './store'
import {
  createSpecies, createTree, createZone, deleteTree, getDashboardStats, getMapTrees, getMapZones,
  getPublicTree, getSpecies, getTree, getTrees, getZones, updateTree,
} from './farm'

const errorOf = async (p: Promise<unknown>) => {
  try { await p } catch (e: any) { return e.response?.data?.error as string }
  throw new Error('expected a rejection')
}

beforeEach(() => resetStoreForTests(createMemoryStore()))

describe('createTree', () => {
  it('upper-cases the code and refuses a duplicate', async () => {
    const t = await createTree({ tree_code: ' t-001 ' })
    expect(t.tree_code).toBe('T-001')
    expect(await errorOf(createTree({ tree_code: 'T-001' }))).toBe('Tree code T-001 already exists')
  })

  it('makes ZONECODE-NNN when no code is given', async () => {
    const zone = await createZone({ zone_code: 'north', zone_name: 'North' })
    await createTree({ tree_code: 'NORTH-001' })
    await createTree({ tree_code: 'NORTH-002' })
    const t = await createTree({ zone_id: String(zone.id) })
    expect(t.tree_code).toBe('NORTH-003')
    expect(await errorOf(createTree({}))).toBe('Choose a zone or enter a tree code')
  })

  it('turns form strings into numbers and empty strings into null', async () => {
    const t = await createTree({ tree_code: 'T-1', height_m: '4.5', coord_x: '', health_score: '7' })
    expect(t).toMatchObject({ height_m: 4.5, coord_x: null, health_score: 7, status: 'pending' })
  })

  it('refuses an unknown action', async () => {
    expect(await errorOf(createTree({ tree_code: 'T-1', action: 'burn' }))).toBe('Unknown action: burn')
  })

  it('takes the tree back out when its log entry cannot be written', async () => {
    const base = createMemoryStore()
    resetStoreForTests({ ...base, put: async (s, v) => {
      if (s === 'activity') throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
      return base.put(s, v)
    } })
    expect(await errorOf(createTree({ tree_code: 'T-1' })))
      .toBe('Storage on this device is full. Save your farm to a file, then remove some photos.')
    expect(await base.all('trees')).toEqual([])
  })

  it('logs tree_created', async () => {
    await createTree({ tree_code: 'T-1' })
    const activity = await (await getStore()).all<any>('activity')
    expect(activity).toHaveLength(1)
    expect(activity[0]).toMatchObject({ tree_code: 'T-1', action_taken: 'tree_created', new_status: 'pending' })
  })
})

describe('getTrees', () => {
  beforeEach(async () => {
    const north = await createZone({ zone_code: 'NORTH', zone_name: 'North' })
    const south = await createZone({ zone_code: 'SOUTH', zone_name: 'South' })
    const mango = await createSpecies({ common_name: 'Mango', scientific_name: 'Mangifera indica' })
    await createTree({ tree_code: 'N-2', zone_id: north.id, species_id: mango.id, action: 'cut', priority: 'urgent' })
    await createTree({ tree_code: 'N-1', zone_id: north.id, action: 'trim' })
    await createTree({ tree_code: 'S-1', zone_id: south.id, action: 'cut' })
  })

  it('returns trees sorted by code with the server shape', async () => {
    const res = await getTrees()
    expect(res.total).toBe(3)
    expect(res.page).toBe(1)
    expect(res.trees.map((t: any) => t.tree_code)).toEqual(['N-1', 'N-2', 'S-1'])
    expect(res.trees[1]).toMatchObject({
      species: { common_name: 'Mango', scientific_name: 'Mangifera indica', ecosystem_roles: null },
      land_zones: { zone_code: 'NORTH', zone_name: 'North' },
      assigned_user: null,
    })
  })

  it('filters like the server', async () => {
    const zones = await getZones()
    const north = zones.find((z: any) => z.zone_code === 'NORTH')!
    expect((await getTrees({ zone: String(north.id) })).total).toBe(2)
    expect((await getTrees({ action: 'cut' })).total).toBe(2)
    expect((await getTrees({ priority: 'urgent' })).trees.map((t: any) => t.tree_code)).toEqual(['N-2'])
    expect((await getTrees({ search: 'n-' })).total).toBe(2)
    expect((await getTrees({ status: 'completed' })).total).toBe(0)
  })

  it('pages with limit and page', async () => {
    const res = await getTrees({ limit: 2, page: 2 })
    expect(res.trees.map((t: any) => t.tree_code)).toEqual(['S-1'])
    expect(res.total).toBe(3)
    expect(res.page).toBe(2)
  })
})

describe('updateTree', () => {
  it('to completed sets completed_at and logs status_changed', async () => {
    await createTree({ tree_code: 'T-1' })
    const t = await updateTree('t-1', { status: 'completed', log_notes: 'Done today' })
    expect(t.status).toBe('completed')
    expect(t.completed_at).toEqual(expect.any(String))
    const log = (await (await getStore()).all<any>('activity')).find(a => a.action_taken === 'status_changed')
    expect(log).toMatchObject({ previous_status: 'pending', new_status: 'completed', notes: 'Done today' })
  })

  it('accepts every status the tree screens offer', async () => {
    await createTree({ tree_code: 'T-1' })
    for (const status of ['in_progress', 'on_hold', 'completed', 'pending']) {
      expect((await updateTree('T-1', { status })).status).toBe(status)
    }
  })

  it('refuses an update with no known fields', async () => {
    await createTree({ tree_code: 'T-1' })
    expect(await errorOf(updateTree('T-1', { colour: 'green' }))).toBe('No valid fields to update')
  })

  it('answers 404 for a missing tree', async () => {
    expect(await errorOf(updateTree('NOPE', { status: 'completed' }))).toBe('Tree not found')
  })
})

describe('deleteTree', () => {
  it('removes the tree and its log', async () => {
    await createTree({ tree_code: 'T-1' })
    expect(await deleteTree('T-1')).toEqual({ success: true })
    expect(await errorOf(getTree('T-1'))).toBe('Tree not found')
    expect(await (await getStore()).all('activity')).toEqual([])
  })
})

describe('zones, map and dashboard', () => {
  beforeEach(async () => {
    const north = await createZone({ zone_code: 'NORTH', zone_name: 'North', boundary_coords: [[0, 0], [10, 0], [10, 10]] })
    const fig = await createSpecies({ common_name: 'Fig' })
    await createTree({ tree_code: 'N-1', zone_id: north.id, species_id: fig.id, coord_x: 3, coord_y: 4, action: 'cut' })
    await createTree({ tree_code: 'N-2', zone_id: north.id, custom_common_name: 'Old fig', priority: 'urgent' })
    await createTree({ tree_code: 'X-1', action: 'trim' })
    await updateTree('N-2', { status: 'completed' })
  })

  it('getZones returns zone_summary rows', async () => {
    expect(await getZones()).toEqual([
      expect.objectContaining({ zone_code: 'NORTH', zone_name: 'North', project_id: null, total_trees: 2, completed: 1 }),
    ])
  })

  it('getMapZones returns the zone rows with their boundary', async () => {
    expect(await getMapZones()).toEqual([
      expect.objectContaining({ zone_code: 'NORTH', boundary_coords: [[0, 0], [10, 0], [10, 10]], project_id: null }),
    ])
  })

  it('getMapTrees returns the map view shape', async () => {
    const trees = await getMapTrees()
    const byCode = Object.fromEntries(trees.map((t: any) => [t.tree_code, t]))
    expect(byCode['N-1']).toMatchObject({ display_name: 'Fig', zone_code: 'NORTH', coord_x: 3, coord_y: 4, action: 'cut' })
    expect(byCode['N-2'].display_name).toBe('Old fig')
    expect(byCode['X-1']).toMatchObject({ display_name: 'X-1', zone_code: null })
  })

  it('getDashboardStats counts like the server', async () => {
    const { stats, zones } = await getDashboardStats()
    expect(stats).toEqual({ total: 3, pending: 2, inProgress: 0, completed: 1, toCut: 1, toTrim: 1, urgent: 1 })
    expect(zones).toHaveLength(1)
  })
})

describe('species and the public page', () => {
  it('getSpecies sorts by common name and createSpecies needs a name', async () => {
    await createSpecies({ common_name: 'Mango' })
    await createSpecies({ common_name: 'Jackfruit', scientific_name: 'Artocarpus heterophyllus', extra: 'dropped' })
    const all = await getSpecies()
    expect(all.map((s: any) => s.common_name)).toEqual(['Jackfruit', 'Mango'])
    expect(all[0]).not.toHaveProperty('extra')
    expect(await errorOf(createSpecies({ scientific_name: 'X' }))).toBe('Common name is required')
  })

  it('getPublicTree returns the public shape', async () => {
    const s = await createSpecies({ common_name: 'Mango', scientific_name: 'Mangifera indica', fun_fact: 'King of fruits' })
    await createTree({ tree_code: 'T-1', species_id: s.id, height_m: 6, public_notes: 'By the gate' })
    expect(await getPublicTree('t-1')).toMatchObject({
      code: 'T-1', name: 'Mango', species: 'Mangifera indica', funFact: 'King of fruits',
      publicNotes: 'By the gate', height: 6, ecosystemRoles: [], contributors: [],
    })
  })
})
