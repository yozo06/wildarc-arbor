import { getStore, newUid, type LocalStore } from './store'
import { fail } from './errors'
import { logActivity, ownerName } from './farm'

// A tree's health observations and work log on the phone, in the shapes the server returns.

type Row = Record<string, any>

const HEALTH_TEXT = ['leaf_color', 'bark_condition', 'pest_presence', 'disease_signs', 'additional_notes', 'notes', 'observed_issues']
const ACTIVITY_LIMIT = 100

const upper = (code: string) => String(code).trim().toUpperCase()
const newestFirst = (field: string) => (a: Row, b: Row) =>
  String(b[field]).localeCompare(String(a[field])) || b.id - a.id

async function findTree(store: LocalStore, code: string): Promise<Row> {
  return (await store.get<Row>('trees', upper(code))) ?? fail(404, 'Tree not found')
}

async function forTree(store: LocalStore, s: 'health' | 'activity', code: string): Promise<Row[]> {
  return (await store.all<Row>(s)).filter(r => r.tree_code === upper(code))
}

export async function getHealth(code: string) {
  const store = await getStore()
  const name = await ownerName(store)
  return (await forTree(store, 'health', code)).sort(newestFirst('observed_at')).map(r => ({ ...r, users: { name } }))
}

/** Keeps every field the health form sends, and sets the tree's current health score, like the server. */
export async function addHealth(code: string, data: Row) {
  const store = await getStore()
  const tree = await findTree(store, code)
  const score = data?.health_score === '' || data?.health_score == null ? NaN : Number(data.health_score)
  if (!(score >= 1 && score <= 10)) fail(400, 'Health score must be between 1 and 10')
  const row: Row = {
    id: await store.nextId('health'), uid: newUid(), tree_code: tree.tree_code, observed_at: new Date().toISOString(),
    observed_by: 1, health_score: score,
    height_m: data.height_m === '' || data.height_m == null ? null : Number(data.height_m),
  }
  for (const f of HEALTH_TEXT) row[f] = data[f] || null
  await store.put('health', row)
  await store.put('trees', { ...tree, health_score: score, updated_at: row.observed_at })
  return row
}

export async function getActivity(code: string) {
  const store = await getStore()
  const name = await ownerName(store)
  return (await forTree(store, 'activity', code))
    .sort(newestFirst('logged_at'))
    .slice(0, ACTIVITY_LIMIT)
    .map(r => ({ ...r, users: { name, role: 'owner' } }))
}

export async function addActivity(code: string, action_taken: string, notes?: string) {
  if (!String(action_taken ?? '').trim()) fail(400, 'Action taken is required')
  const store = await getStore()
  const tree = await findTree(store, code)
  return logActivity(store, { tree_code: tree.tree_code, action_taken, notes: notes || null })
}

export async function getContributors(_code?: string) {
  return []
}

export async function addContributor(_code?: string, _data?: unknown): Promise<never> {
  return fail(400, 'Not available on the phone version')
}
