import { describe, it, expect, beforeEach } from 'vitest'
import { createMemoryStore, getStore, resetStoreForTests } from './store'
import { createTree, getTree } from './farm'
import { addActivity, addContributor, addHealth, getActivity, getContributors, getHealth } from './logs'

const errorOf = async (p: Promise<unknown>) => {
  try { await p } catch (e: any) { return e.response?.data?.error as string }
  throw new Error('expected a rejection')
}

beforeEach(async () => {
  resetStoreForTests(createMemoryStore())
  await createTree({ tree_code: 'T-1' })
})

describe('health', () => {
  it('addHealth keeps every field the form sends and updates the tree', async () => {
    const form = {
      health_score: '7', leaf_color: 'green', bark_condition: 'cracked', pest_presence: 'none',
      disease_signs: 'none', height_m: '5.5', additional_notes: 'new shoots',
    }
    const row = await addHealth('t-1', form)
    expect(row).toMatchObject({
      tree_code: 'T-1', health_score: 7, leaf_color: 'green', bark_condition: 'cracked', pest_presence: 'none',
      disease_signs: 'none', height_m: 5.5, additional_notes: 'new shoots', observed_at: expect.any(String),
    })
    expect((await getTree('T-1')).health_score).toBe(7)
  })

  it('getHealth returns newest first with the observer name', async () => {
    await addHealth('T-1', { health_score: 5 })
    await addHealth('T-1', { health_score: 8 })
    const rows = await getHealth('T-1')
    expect(rows.map((r: any) => r.health_score)).toEqual([8, 5])
    expect(rows[0].users).toEqual({ name: 'You' })
  })

  it('refuses a score outside 1 to 10, or none', async () => {
    expect(await errorOf(addHealth('T-1', { health_score: 11 }))).toBe('Health score must be between 1 and 10')
    expect(await errorOf(addHealth('T-1', {}))).toBe('Health score must be between 1 and 10')
  })

  it('answers 404 for a missing tree', async () => {
    expect(await errorOf(addHealth('NOPE', { health_score: 5 }))).toBe('Tree not found')
  })
})

describe('work log', () => {
  it('getActivity returns newest first, at most 100', async () => {
    for (let i = 0; i < 101; i++) await addActivity('T-1', 'watered', `round ${i}`)
    const rows = await getActivity('T-1')
    expect(rows).toHaveLength(100)
    expect(rows[0]).toMatchObject({ action_taken: 'watered', notes: 'round 100', users: { name: 'You', role: 'owner' } })
  })

  it('addActivity needs an action and returns the row without users', async () => {
    const row = await addActivity('T-1', 'mulched')
    expect(row).toMatchObject({ tree_code: 'T-1', action_taken: 'mulched', notes: null })
    expect(row).not.toHaveProperty('users')
    expect(await errorOf(addActivity('T-1', ''))).toBe('Action taken is required')
  })

  it('only keeps entries for the tree asked about', async () => {
    await createTree({ tree_code: 'T-2' })
    await addActivity('T-2', 'pruned')
    expect((await getActivity('T-1')).map((r: any) => r.action_taken)).toEqual(['tree_created'])
    expect((await (await getStore()).all('activity'))).toHaveLength(3)
  })
})

describe('contributors', () => {
  it('are empty on the phone and cannot be added', async () => {
    expect(await getContributors('T-1')).toEqual([])
    expect(await errorOf(addContributor('T-1', {}))).toBe('Not available on the phone version')
  })
})
