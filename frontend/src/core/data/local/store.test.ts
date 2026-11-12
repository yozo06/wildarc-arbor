import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { createMemoryStore, getStore, resetStoreForTests, type LocalStore } from './store'

type Tree = { tree_code: string; name?: string }
type Species = { id: number; common_name: string }

const makers: Array<[string, () => Promise<LocalStore>]> = [
  ['memory', async () => createMemoryStore()],
  ['indexeddb', async () => {
    globalThis.indexedDB = new IDBFactory()
    resetStoreForTests()
    return getStore()
  }],
]

describe.each(makers)('LocalStore (%s)', (kind, make) => {
  let store: LocalStore
  beforeEach(async () => { store = await make() })

  it('reports its kind', () => {
    expect(store.kind).toBe(kind)
  })

  it('put then get returns the record', async () => {
    await store.put<Tree>('trees', { tree_code: 'T-001', name: 'Mango' })
    expect(await store.get<Tree>('trees', 'T-001')).toEqual({ tree_code: 'T-001', name: 'Mango' })
  })

  it('all returns every record', async () => {
    await store.put<Species>('species', { id: 1, common_name: 'Mango' })
    await store.put<Species>('species', { id: 2, common_name: 'Jackfruit' })
    const all = await store.all<Species>('species')
    expect(all.map(s => s.common_name).sort()).toEqual(['Jackfruit', 'Mango'])
  })

  it('remove deletes', async () => {
    await store.put<Species>('species', { id: 1, common_name: 'Mango' })
    await store.remove('species', 1)
    expect(await store.get('species', 1)).toBeUndefined()
  })

  it('nextId starts at 1 and increases per store', async () => {
    expect(await store.nextId('species')).toBe(1)
    expect(await store.nextId('species')).toBe(2)
    expect(await store.nextId('zones')).toBe(1)
  })

  it('nextId continues after the highest id already stored', async () => {
    await store.put<Species>('species', { id: 7, common_name: 'Mango' })
    expect(await store.nextId('species')).toBe(8)
  })

  it('replaceAll swaps the named stores and leaves the others', async () => {
    await store.put<Tree>('trees', { tree_code: 'OLD-001' })
    await store.put<Species>('species', { id: 1, common_name: 'Mango' })
    await store.replaceAll({ trees: [{ tree_code: 'NEW-001' }] })
    expect((await store.all<Tree>('trees')).map(t => t.tree_code)).toEqual(['NEW-001'])
    expect(await store.get('species', 1)).toEqual({ id: 1, common_name: 'Mango' })
  })

  it('replaceAll is all-or-nothing', async () => {
    await store.put<Tree>('trees', { tree_code: 'OLD-001' })
    await expect(store.replaceAll({ trees: [{ tree_code: 'NEW-001' }, { tree_code: undefined }] })).rejects.toThrow()
    expect((await store.all<Tree>('trees')).map(t => t.tree_code)).toEqual(['OLD-001'])
  })
})

describe('getStore', () => {
  afterEach(() => { vi.restoreAllMocks(); resetStoreForTests() })

  it('falls back to memory when IndexedDB cannot be opened', async () => {
    globalThis.indexedDB = new IDBFactory()
    vi.spyOn(globalThis.indexedDB, 'open').mockImplementation(() => { throw new Error('blocked') })
    resetStoreForTests()
    expect((await getStore()).kind).toBe('memory')
  })
})
