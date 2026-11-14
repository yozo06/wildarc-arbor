import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createMemoryStore, getStore, resetStoreForTests, type LocalStore } from './store'
import { createTree } from './farm'
import { getPhotos, setImageShrinker, uploadPhoto } from './photos'

const STORAGE_FULL = 'Storage on this device is full. Save your farm to a file, then remove some photos.'
const errorOf = async (p: Promise<unknown>) => {
  try { await p } catch (e: any) { return e.response?.data?.error as string }
  throw new Error('expected a rejection')
}
const photoFile = () => new File(['raw-image'], 'IMG_0001.HEIC', { type: 'image/heic' })

/** A memory store whose writes to one store fail as a full phone would. */
function fullFor(name: string): LocalStore {
  const base = createMemoryStore()
  return { ...base, put: async (s, v) => {
    if (s === name) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    return base.put(s, v)
  } }
}

beforeEach(async () => {
  resetStoreForTests(createMemoryStore())
  await createTree({ tree_code: 'T-1' })
  setImageShrinker(async () => ({ bytes: Uint8Array.of(7, 7, 7), mime: 'image/jpeg' }))
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn((b: Blob) => `blob:${b.size}`) }))
})
afterEach(() => { setImageShrinker(); vi.unstubAllGlobals() })

describe('photos on the phone', () => {
  it('upload stores the shrunk image and returns it with a photo_url', async () => {
    const row = await uploadPhoto('t-1', photoFile(), 'general', 'north side')
    expect(row).toMatchObject({ tree_code: 'T-1', photo_type: 'general', caption: 'north side', photo_url: 'blob:3' })
    expect(row).not.toHaveProperty('bytes')
    const stored = await (await getStore()).get<any>('photos', row.id)
    expect(Array.from(stored.bytes)).toEqual([7, 7, 7])
    expect(stored.mime).toBe('image/jpeg')
  })

  it('logs photo_uploaded on the tree', async () => {
    await uploadPhoto('T-1', photoFile(), 'general')
    const log = (await (await getStore()).all<any>('activity')).map(a => a.action_taken)
    expect(log).toContain('photo_uploaded')
  })

  it('getPhotos returns this tree only, newest first, with the person', async () => {
    await createTree({ tree_code: 'T-2' })
    const first = await uploadPhoto('T-1', photoFile(), 'general')
    await uploadPhoto('T-2', photoFile(), 'general')
    const second = await uploadPhoto('T-1', photoFile(), 'general')
    const rows = await getPhotos('T-1')
    expect(rows.map((r: any) => r.id)).toEqual([second.id, first.id])
    expect(rows[0]).toMatchObject({ photo_url: expect.stringMatching(/^blob:/), users: { name: 'You' } })
  })

  it('refuses a photo for a missing tree', async () => {
    expect(await errorOf(uploadPhoto('NOPE', photoFile(), 'general'))).toBe('Tree not found')
  })

  it('says plainly when the phone is full, and saves nothing', async () => {
    const store = fullFor('photos')
    resetStoreForTests(store)
    await createTree({ tree_code: 'T-1' })
    const activityBefore = (await store.all('activity')).length
    expect(await errorOf(uploadPhoto('T-1', photoFile(), 'general'))).toBe(STORAGE_FULL)
    expect(await store.all('photos')).toEqual([])
    expect((await store.all('activity')).length).toBe(activityBefore)
  })

  it('takes the photo back out when the log entry cannot be written', async () => {
    const store = fullFor('activity')
    resetStoreForTests(store)
    await store.put('trees', { id: 1, tree_code: 'T-1' })
    expect(await errorOf(uploadPhoto('T-1', photoFile(), 'general'))).toBe(STORAGE_FULL)
    expect(await store.all('photos')).toEqual([])
  })
})
