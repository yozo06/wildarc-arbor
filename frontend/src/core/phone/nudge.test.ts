import { describe, it, expect } from 'vitest'
import { daysSince, shouldNudge } from './nudge'

const now = new Date('2026-11-20T12:00:00.000Z')
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString()

describe('shouldNudge', () => {
  it('waits until more than seven days have passed since the last save', () => {
    expect(shouldNudge({ lastSavedAt: daysAgo(6), startedAt: daysAgo(30), treeCount: 3, sample: false }, now)).toBe(false)
    expect(shouldNudge({ lastSavedAt: daysAgo(8), startedAt: daysAgo(30), treeCount: 3, sample: false }, now)).toBe(true)
  })
  it('counts from the start when the farm was never saved', () => {
    expect(shouldNudge({ startedAt: daysAgo(3), treeCount: 3, sample: false }, now)).toBe(false)
    expect(shouldNudge({ startedAt: daysAgo(9), treeCount: 3, sample: false }, now)).toBe(true)
    expect(shouldNudge({ treeCount: 3, sample: false }, now)).toBe(true)
  })
  it('never nudges for the sample or an empty farm', () => {
    expect(shouldNudge({ lastSavedAt: daysAgo(30), treeCount: 3, sample: true }, now)).toBe(false)
    expect(shouldNudge({ lastSavedAt: daysAgo(30), treeCount: 0, sample: false }, now)).toBe(false)
  })
})

describe('daysSince', () => {
  it('counts whole days', () => {
    expect(daysSince(daysAgo(9.5), now)).toBe(9)
  })
})
