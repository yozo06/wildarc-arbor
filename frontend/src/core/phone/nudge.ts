// When to remind someone to save their farm to a file: more than a week since the last save (or since they
// started, if they never saved), as long as there is a real farm to lose.

export const NUDGE_AFTER_DAYS = 7
const DAY = 86400000

export function daysSince(iso: string, now = new Date()): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / DAY)
}

export function shouldNudge(
  farm: { lastSavedAt?: string; startedAt?: string; treeCount: number; sample: boolean },
  now = new Date(),
): boolean {
  if (farm.sample || farm.treeCount === 0) return false
  const since = farm.lastSavedAt ?? farm.startedAt
  if (!since) return true
  return now.getTime() - new Date(since).getTime() > NUDGE_AFTER_DAYS * DAY
}
