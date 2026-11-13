import { describe, it, expect, beforeEach } from 'vitest'
import { createMemoryStore, resetStoreForTests } from './store'
import { createUser, deactivateUser, getMe, getOwner, getUsers, LOCAL_OWNER_ID, updateUser } from './owner'

const errorOf = async (p: Promise<unknown>) => {
  try { await p } catch (e: any) { return { status: e.response?.status, error: e.response?.data?.error } }
  throw new Error('expected a rejection')
}

beforeEach(() => resetStoreForTests(createMemoryStore()))

describe('the phone owner', () => {
  it('starts as "You", the owner, with id 1', async () => {
    const owner = await getOwner()
    expect(owner).toMatchObject({ id: LOCAL_OWNER_ID, name: 'You', email: '', role: 'owner', is_active: true })
    expect(owner).not.toHaveProperty('key')
    expect(await getUsers()).toEqual([owner])
    expect(await getMe()).toEqual(owner)
  })

  it('updateUser changes name, phone and bio of the owner only', async () => {
    const updated = await updateUser(1, { name: 'Asha', phone: '12345', bio: 'Grows mangoes', role: 'viewer' })
    expect(updated).toMatchObject({ id: 1, name: 'Asha', phone: '12345', bio: 'Grows mangoes', role: 'owner' })
    expect((await getOwner()).name).toBe('Asha')
  })

  it('keeps a field when the form sends it empty, like the server', async () => {
    await updateUser(1, { name: 'Asha' })
    expect((await updateUser(1, { name: '' })).name).toBe('Asha')
  })

  it('refuses another user', async () => {
    expect(await errorOf(updateUser(2, { name: 'X' }))).toEqual({ status: 403, error: 'You can only edit your own profile' })
  })

  it('has no team on the phone', async () => {
    expect((await errorOf(createUser({}))).error).toBe('Not available on the phone version')
    expect((await errorOf(deactivateUser(1))).error).toBe('Not available on the phone version')
  })
})
