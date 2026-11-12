import { getStore, newUid, type LocalStore } from './store'
import { fail } from './errors'

// Trees, species, zones, the map and the dashboard, answered from the phone. Every function takes the same
// arguments as its server twin in modules/arbor/api and returns the same shape the server sends.

type Row = Record<string, any>

const ACTIONS = ['pending', 'cut', 'trim', 'keep', 'monitor', 'treat', 'replant']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const STATUSES = ['pending', 'in_progress', 'completed']
const NUMERIC = [
  'species_id', 'zone_id', 'assigned_to', 'health_score', 'approx_age_yrs', 'height_m', 'trunk_diameter_cm',
  'coord_x', 'coord_y',
]
const TREE_FIELDS = [
  'tree_code', 'species_id', 'zone_id', 'custom_common_name', 'custom_fun_fact', 'health_score', 'action', 'status',
  'priority', 'coord_x', 'coord_y', 'approx_age_yrs', 'height_m', 'trunk_diameter_cm', 'action_notes', 'public_notes',
  'planting_date', 'assigned_to',
]

const now = () => new Date().toISOString()
const upper = (code: string) => String(code).trim().toUpperCase()
const byText = (key: string) => (a: Row, b: Row) => String(a[key] ?? '').localeCompare(String(b[key] ?? ''))
const byCode = (a: Row, b: Row) => (a.tree_code < b.tree_code ? -1 : a.tree_code > b.tree_code ? 1 : 0)

function pick(data: Row | undefined, fields: string[]): Row {
  const out: Row = {}
  for (const f of fields) if (data && data[f] !== undefined) out[f] = data[f]
  return out
}

/** Forms send numbers as strings, as the server's coercion expects. Empty strings mean "no value". */
export function coerceTreeInput(data: Row): Row {
  const out: Row = {}
  for (const [k, v] of Object.entries(data ?? {})) {
    if (v === '') out[k] = null
    else if (NUMERIC.includes(k) && v !== null) {
      const n = Number(v)
      if (Number.isNaN(n)) fail(400, `${k} must be a number`)
      out[k] = n
    } else if ((k === 'tree_code' || k === 'zone_code') && typeof v === 'string') out[k] = upper(v)
    else out[k] = v
  }
  return out
}

function checkChoices(row: Row) {
  if (row.action != null && !ACTIONS.includes(row.action)) fail(400, `Unknown action: ${row.action}`)
  if (row.priority != null && !PRIORITIES.includes(row.priority)) fail(400, `Unknown priority: ${row.priority}`)
  if (row.status != null && !STATUSES.includes(row.status)) fail(400, `Unknown status: ${row.status}`)
  if (row.health_score != null && (row.health_score < 1 || row.health_score > 10)) {
    fail(400, 'Health score must be between 1 and 10')
  }
}

export async function ownerName(store: LocalStore): Promise<string> {
  return (await store.get<Row>('meta', 'owner'))?.name ?? 'You'
}

/** Adds a row to a tree's work log, the way the server's tree_activity_log does. */
export async function logActivity(store: LocalStore, row: Row): Promise<Row> {
  const entry = {
    id: await store.nextId('activity'), uid: newUid(), previous_status: null, new_status: null, notes: null,
    logged_at: now(), logged_by: 1, ...row,
  }
  await store.put('activity', entry)
  return entry
}

async function findTree(store: LocalStore, code: string): Promise<Row> {
  return (await store.get<Row>('trees', upper(code))) ?? fail(404, 'Tree not found')
}

async function nextCodeInZone(store: LocalStore, zoneCode: string): Promise<string> {
  const prefix = `${zoneCode}-`
  const used = (await store.all<Row>('trees'))
    .map(t => String(t.tree_code))
    .filter(c => c.startsWith(prefix) && /^\d+$/.test(c.slice(prefix.length)))
    .map(c => Number(c.slice(prefix.length)))
  return prefix + String(Math.max(0, ...used) + 1).padStart(3, '0')
}

async function lookups(store: LocalStore) {
  const [species, zones] = await Promise.all([store.all<Row>('species'), store.all<Row>('zones')])
  return { species: new Map(species.map(s => [s.id, s])), zones: new Map(zones.map(z => [z.id, z])) }
}

function listRow(t: Row, species?: Row, zone?: Row): Row {
  return {
    id: t.id, tree_code: t.tree_code, custom_common_name: t.custom_common_name ?? null,
    health_score: t.health_score ?? null, action: t.action ?? null, status: t.status ?? null,
    priority: t.priority ?? null, coord_x: t.coord_x ?? null, coord_y: t.coord_y ?? null, updated_at: t.updated_at,
    species: species
      ? { common_name: species.common_name, scientific_name: species.scientific_name ?? null, ecosystem_roles: species.ecosystem_roles ?? null }
      : null,
    land_zones: zone ? { zone_code: zone.zone_code, zone_name: zone.zone_name } : null,
    assigned_user: null,
  }
}

export async function getTrees(params: Row = {}) {
  const store = await getStore()
  const { species, zones } = await lookups(store)
  let rows = await store.all<Row>('trees')
  if (params.zone) rows = rows.filter(t => t.zone_id === Number(params.zone))
  for (const f of ['action', 'status', 'priority']) if (params[f]) rows = rows.filter(t => t[f] === params[f])
  if (params.assigned_to) rows = rows.filter(t => t.assigned_to === Number(params.assigned_to))
  if (params.search) rows = rows.filter(t => t.tree_code.includes(upper(params.search)))
  rows.sort(byCode)
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 50
  const trees = rows.slice((page - 1) * limit, page * limit)
    .map(t => listRow(t, species.get(t.species_id), zones.get(t.zone_id)))
  return { trees, total: rows.length, page }
}

export async function getTree(code: string) {
  const store = await getStore()
  const tree = await findTree(store, code)
  const { species, zones } = await lookups(store)
  return {
    ...tree,
    species: species.get(tree.species_id) ?? null,
    land_zones: zones.get(tree.zone_id) ?? null,
    assigned_user: null,
    added_user: { name: await ownerName(store) },
    tree_contributors: [],
  }
}

export async function createTree(data: Row) {
  const store = await getStore()
  const input = coerceTreeInput(pick(data, TREE_FIELDS))
  checkChoices(input)
  let code: string | null = input.tree_code ?? null
  if (!code) {
    if (input.zone_id == null) fail(400, 'Choose a zone or enter a tree code')
    const zone = (await store.get<Row>('zones', input.zone_id)) ?? fail(400, 'Zone not found')
    code = await nextCodeInZone(store, zone.zone_code)
  }
  if (await store.get('trees', code)) fail(409, `Tree code ${code} already exists`)
  const stamp = now()
  const tree = {
    status: 'pending', ...input, tree_code: code, id: await store.nextId('trees'), uid: newUid(),
    added_by: 1, created_at: stamp, updated_at: stamp, completed_at: null,
  }
  await store.put('trees', tree)
  await logActivity(store, { tree_code: code, action_taken: 'tree_created', new_status: 'pending' })
  return tree
}

export async function updateTree(code: string, data: Row) {
  const store = await getStore()
  const tree = await findTree(store, code)
  const changes = coerceTreeInput(pick(data, TREE_FIELDS.filter(f => f !== 'tree_code')))
  if (!Object.keys(changes).length) fail(400, 'No valid fields to update')
  checkChoices(changes)
  const next: Row = { ...tree, ...changes, updated_at: now() }
  const statusChanged = changes.status != null && changes.status !== tree.status
  if (statusChanged && changes.status === 'completed') next.completed_at = now()
  await store.put('trees', next)
  if (statusChanged) {
    await logActivity(store, {
      tree_code: tree.tree_code, action_taken: 'status_changed', previous_status: tree.status,
      new_status: changes.status, notes: data?.log_notes ?? null,
    })
  }
  return next
}

export async function deleteTree(code: string) {
  const store = await getStore()
  const tree = await findTree(store, code)
  await store.remove('trees', tree.tree_code)
  for (const s of ['health', 'activity', 'photos'] as const) {
    for (const row of await store.all<Row>(s)) if (row.tree_code === tree.tree_code) await store.remove(s, row.id)
  }
  return { success: true }
}

export async function getSpecies() {
  return (await (await getStore()).all<Row>('species')).sort(byText('common_name'))
}

export async function getEcosystemRoles() {
  return []
}

export async function createSpecies(data: Row) {
  const store = await getStore()
  const common = String(data?.common_name ?? '').trim()
  if (!common) fail(400, 'Common name is required')
  const row = {
    id: await store.nextId('species'), uid: newUid(), common_name: common,
    scientific_name: data.scientific_name || null, description: data.description || null, fun_fact: data.fun_fact || null,
  }
  await store.put('species', row)
  return row
}

export async function createZone(data: Row) {
  const store = await getStore()
  const code = upper(data?.zone_code ?? '')
  const name = String(data?.zone_name ?? '').trim()
  if (!code) fail(400, 'Zone code is required')
  if (!name) fail(400, 'Zone name is required')
  if ((await store.all<Row>('zones')).some(z => z.zone_code === code)) fail(409, `Zone code ${code} already exists`)
  const row = {
    id: await store.nextId('zones'), uid: newUid(), zone_code: code, zone_name: name,
    description: data.description || null, boundary_coords: data.boundary_coords ?? null, project_id: null,
  }
  await store.put('zones', row)
  return row
}

export async function getZones() {
  const store = await getStore()
  const [zones, trees] = await Promise.all([store.all<Row>('zones'), store.all<Row>('trees')])
  return zones.sort(byText('zone_code')).map(z => {
    const inZone = trees.filter(t => t.zone_id === z.id)
    return {
      id: z.id, zone_code: z.zone_code, zone_name: z.zone_name, project_id: null,
      total_trees: inZone.length, completed: inZone.filter(t => t.status === 'completed').length,
    }
  })
}

export async function getMapZones() {
  const zones = await (await getStore()).all<Row>('zones')
  return zones.sort(byText('zone_code')).map(z => ({
    id: z.id, zone_code: z.zone_code, zone_name: z.zone_name, description: z.description ?? null,
    boundary_coords: z.boundary_coords ?? null, project_id: null,
  }))
}

export async function getMapTrees() {
  const store = await getStore()
  const { species, zones } = await lookups(store)
  return (await store.all<Row>('trees')).sort(byCode).map(t => ({
    id: t.id, tree_code: t.tree_code, action: t.action ?? null, coord_x: t.coord_x ?? null, coord_y: t.coord_y ?? null,
    display_name: t.custom_common_name || species.get(t.species_id)?.common_name || t.tree_code,
    zone_code: zones.get(t.zone_id)?.zone_code ?? null, health_score: t.health_score ?? null,
    height_m: t.height_m ?? null, status: t.status ?? null,
  }))
}

export async function getDashboardStats() {
  const trees = await (await getStore()).all<Row>('trees')
  const count = (pred: (t: Row) => boolean) => trees.filter(pred).length
  return {
    stats: {
      total: trees.length,
      pending: count(t => t.status === 'pending'),
      inProgress: count(t => t.status === 'in_progress'),
      completed: count(t => t.status === 'completed'),
      toCut: count(t => t.action === 'cut'),
      toTrim: count(t => t.action === 'trim'),
      urgent: count(t => t.priority === 'urgent'),
    },
    zones: await getZones(),
  }
}

export async function getPublicTree(code: string) {
  const store = await getStore()
  const tree = await findTree(store, code)
  const { species, zones } = await lookups(store)
  const s = species.get(tree.species_id)
  return {
    code: tree.tree_code, name: tree.custom_common_name || s?.common_name || null,
    species: s?.scientific_name ?? null, description: s?.description ?? null,
    funFact: tree.custom_fun_fact || s?.fun_fact || null, publicNotes: tree.public_notes ?? null,
    age: tree.approx_age_yrs ?? null, height: tree.height_m ?? null, status: tree.status ?? null,
    zone: zones.get(tree.zone_id)?.zone_name ?? null, ecosystemRoles: s?.ecosystem_roles ?? [],
    edibleParts: s?.edible_parts ?? null, referenceImages: s?.reference_images ?? [], contributors: [],
    plantingDate: tree.planting_date ?? null,
  }
}
