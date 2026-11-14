import { describe, it, expect, beforeEach } from 'vitest'
import { createMemoryStore, resetStoreForTests, type LocalStore, type StoreName } from './store'
import { createTree, updateTree } from './farm'
import * as api from './api'

const STORAGE_FULL = 'Phone storage is full. Save your farm to a file, then remove some photos.'
const errorOf = async (p: Promise<unknown>) => {
  try { await p } catch (e: any) { return e.response?.data?.error as string }
  throw new Error('expected a rejection')
}

/** A memory store that starts failing writes to one store, as a full phone would, once `full` is set. */
function fillable(name: StoreName) {
  const base = createMemoryStore()
  const state = { full: false }
  const store: LocalStore = { ...base, put: async (s, v) => {
    if (state.full && s === name) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    return base.put(s, v)
  } }
  return { base, store, state }
}

describe('a full phone', () => {
  let phone: ReturnType<typeof fillable>

  it('says so plainly for any write through the data functions', async () => {
    phone = fillable('species')
    resetStoreForTests(phone.store)
    phone.state.full = true
    expect(await errorOf(api.createSpecies({ common_name: 'Fig' }))).toBe(STORAGE_FULL)
  })

  describe('health entries', () => {
    beforeEach(async () => {
      phone = fillable('trees')
      resetStoreForTests(phone.store)
      await createTree({ tree_code: 'T-1' })
      phone.state.full = true
    })

    it('leave nothing half-saved when the tree cannot be updated', async () => {
      expect(await errorOf(api.addHealth('T-1', { health_score: 6 }))).toBe(STORAGE_FULL)
      expect(await phone.base.all('health')).toEqual([])
    })
  })

  describe('status changes', () => {
    beforeEach(async () => {
      phone = fillable('activity')
      resetStoreForTests(phone.store)
      await createTree({ tree_code: 'T-1' })
      phone.state.full = true
    })

    it('put the tree back when the log entry cannot be written', async () => {
      expect(await errorOf(updateTree('T-1', { status: 'completed' }))).toBe(STORAGE_FULL)
      expect((await phone.base.get<any>('trees', 'T-1')).status).toBe('pending')
    })
  })
})
