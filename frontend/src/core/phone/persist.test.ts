import { describe, it, expect, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { getStore, resetStoreForTests } from '../data/local/store'
import { requestPersistence, resetPersistenceForTests } from './persist'

describe('requestPersistence', () => {
  it('asks the browser once', async () => {
    resetPersistenceForTests()
    const persist = vi.fn(async () => true)
    expect(await requestPersistence({ storage: { persist } } as any)).toBe(true)
    expect(await requestPersistence({ storage: { persist } } as any)).toBe(false)
    expect(persist).toHaveBeenCalledTimes(1)
  })

  it('copes with browsers that cannot persist', async () => {
    resetPersistenceForTests()
    expect(await requestPersistence({} as any)).toBe(false)
  })

  it('is asked after the first write to the phone store', async () => {
    resetPersistenceForTests()
    const persist = vi.fn(async () => true)
    vi.stubGlobal('navigator', { ...navigator, storage: { persist } })
    globalThis.indexedDB = new IDBFactory()
    resetStoreForTests()
    const store = await getStore()
    expect(persist).not.toHaveBeenCalled()
    await store.put('species', { id: 1, common_name: 'Mango' })
    await store.put('species', { id: 2, common_name: 'Fig' })
    expect(persist).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
    resetStoreForTests()
  })
})
