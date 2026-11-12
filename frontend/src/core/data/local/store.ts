import { openDB, type IDBPDatabase } from 'idb'

// A small key-value store over IndexedDB, with an in-memory stand-in for browsers that block storage.
// Trees are keyed by tree_code, meta records by key, everything else by a numeric id.

export type StoreName = 'trees' | 'species' | 'zones' | 'health' | 'activity' | 'photos' | 'meta'
type Key = number | string

export const STORE_NAMES: StoreName[] = ['trees', 'species', 'zones', 'health', 'activity', 'photos', 'meta']
const KEY_PATH: Record<StoreName, string> = {
  trees: 'tree_code', meta: 'key',
  species: 'id', zones: 'id', health: 'id', activity: 'id', photos: 'id',
}
const BY_TREE: StoreName[] = ['health', 'activity', 'photos']
const DB_NAME = 'arbor'
const DB_VERSION = 1

export interface LocalStore {
  kind: 'indexeddb' | 'memory'
  all<T>(s: StoreName): Promise<T[]>
  get<T>(s: StoreName, key: Key): Promise<T | undefined>
  put<T>(s: StoreName, value: T): Promise<void>
  remove(s: StoreName, key: Key): Promise<void>
  nextId(s: StoreName): Promise<number>
  replaceAll(data: Partial<Record<StoreName, unknown[]>>): Promise<void>
}

/** A fresh identifier for a record, kept alongside the numeric id so a later sync never renumbers. */
export const newUid = (): string => crypto.randomUUID()

function keyOf(s: StoreName, value: unknown): Key {
  const key = (value as Record<string, unknown> | null)?.[KEY_PATH[s]]
  if (typeof key !== 'number' && typeof key !== 'string') throw new Error(`A ${s} record has no ${KEY_PATH[s]}`)
  return key
}

/** Checks every record before anything is cleared, so a bad record can never empty a store. */
function checkKeys(data: Partial<Record<StoreName, unknown[]>>) {
  for (const [s, rows] of Object.entries(data) as Array<[StoreName, unknown[]]>) rows.forEach(r => keyOf(s, r))
}

function nextFrom(keys: Key[], counter: number | undefined): number {
  const highest = keys.reduce<number>((max, k) => (typeof k === 'number' && k > max ? k : max), 0)
  return Math.max(highest, counter ?? 0) + 1
}

const seqKey = (s: StoreName) => `seq:${s}`

export function createMemoryStore(): LocalStore {
  const maps = new Map<StoreName, Map<Key, unknown>>(STORE_NAMES.map(s => [s, new Map()]))
  const map = (s: StoreName) => maps.get(s)!

  return {
    kind: 'memory',
    async all<T>(s: StoreName) { return [...map(s).values()].map(v => structuredClone(v)) as T[] },
    async get<T>(s: StoreName, key: Key) {
      const v = map(s).get(key)
      return (v === undefined ? undefined : structuredClone(v)) as T | undefined
    },
    async put<T>(s: StoreName, value: T) { map(s).set(keyOf(s, value), structuredClone(value)) },
    async remove(s: StoreName, key: Key) { map(s).delete(key) },
    async nextId(s: StoreName) {
      const counter = (map('meta').get(seqKey(s)) as { value: number } | undefined)?.value
      const next = nextFrom([...map(s).keys()], counter)
      map('meta').set(seqKey(s), { key: seqKey(s), value: next })
      return next
    },
    async replaceAll(data) {
      checkKeys(data)
      const fresh = (Object.entries(data) as Array<[StoreName, unknown[]]>)
        .map(([s, rows]) => [s, new Map(rows.map(r => [keyOf(s, r), structuredClone(r)]))] as const)
      for (const [s, m] of fresh) maps.set(s, m)
    },
  }
}

function createIndexedDbStore(db: IDBPDatabase): LocalStore {
  return {
    kind: 'indexeddb',
    async all<T>(s: StoreName) { return (await db.getAll(s)) as T[] },
    async get<T>(s: StoreName, key: Key) { return (await db.get(s, key)) as T | undefined },
    async put<T>(s: StoreName, value: T) { await db.put(s, value) },
    async remove(s: StoreName, key: Key) { await db.delete(s, key) },
    async nextId(s: StoreName) {
      const tx = db.transaction([s, 'meta'], 'readwrite')
      const keys = (await tx.objectStore(s).getAllKeys()) as Key[]
      const counter = ((await tx.objectStore('meta').get(seqKey(s))) as { value: number } | undefined)?.value
      const next = nextFrom(keys, counter)
      await tx.objectStore('meta').put({ key: seqKey(s), value: next })
      await tx.done
      return next
    },
    async replaceAll(data) {
      checkKeys(data)
      const names = Object.keys(data) as StoreName[]
      if (!names.length) return
      // One transaction across every named store: if any write fails, the clears are rolled back too.
      const tx = db.transaction(names, 'readwrite')
      try {
        for (const s of names) {
          const os = tx.objectStore(s)
          await os.clear()
          for (const row of data[s]!) await os.put(row)
        }
        await tx.done
      } catch (err) {
        try { tx.abort() } catch { /* already finished */ }
        throw err
      }
    },
  }
}

async function openIndexedDb(): Promise<LocalStore> {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(up) {
      for (const s of STORE_NAMES) {
        const os = up.createObjectStore(s, { keyPath: KEY_PATH[s] })
        if (BY_TREE.includes(s)) os.createIndex('by_tree', 'tree_code')
      }
    },
  })
  return createIndexedDbStore(db)
}

let current: Promise<LocalStore> | null = null

/** The store for this page. IndexedDB when the browser allows it, memory otherwise. */
export function getStore(): Promise<LocalStore> {
  if (!current) {
    current = (async () => {
      try {
        if (typeof indexedDB === 'undefined') return createMemoryStore()
        return await openIndexedDb()
      } catch {
        return createMemoryStore()
      }
    })()
  }
  return current
}

/** Small facts about the farm on this phone (last saved, sample loaded, farm name), kept in the meta store. */
export async function readMeta<T>(key: string): Promise<T | undefined> {
  return (await (await getStore()).get<{ key: string; value: T }>('meta', key))?.value
}

export async function writeMeta(key: string, value: unknown): Promise<void> {
  await (await getStore()).put('meta', { key, value })
}

/** Tests only: use this store from now on, or forget the current one so the next call opens afresh. */
export function resetStoreForTests(store?: LocalStore): void {
  current = store ? Promise.resolve(store) : null
}
