import { useEffect, useState } from 'react'
import { getStore, readMeta } from '../data/local/store'
import { onFarmChanged } from './farmEvents'

export interface FarmStatus {
  /** A farm was started, opened from a file, or has trees. Until then Home shows the welcome screen. */
  started: boolean
  sample: boolean
  lastSavedAt?: string
  startedAt?: string
  treeCount: number
  storage: 'indexeddb' | 'memory'
  /** Goes up every time the farm changes, so a screen can be rebuilt from fresh data. */
  version: number
}

export async function readFarmStatus(): Promise<Omit<FarmStatus, 'version'>> {
  const store = await getStore()
  const [sample, lastSavedAt, startedAt, trees] = await Promise.all([
    readMeta<boolean>('sample'), readMeta<string>('lastSavedAt'), readMeta<string>('startedAt'), store.all('trees'),
  ])
  return {
    started: Boolean(startedAt) || trees.length > 0, sample: sample === true, lastSavedAt, startedAt,
    treeCount: trees.length, storage: store.kind,
  }
}

/** The farm's status on this phone, re-read whenever the farm changes. Null while loading. */
export function useFarmStatus(): FarmStatus | null {
  const [status, setStatus] = useState<FarmStatus | null>(null)
  useEffect(() => {
    let live = true
    let version = 0
    const load = () => {
      const v = ++version
      readFarmStatus().then(s => { if (live && v === version) setStatus({ ...s, version: v }) })
    }
    load()
    const off = onFarmChanged(load)
    return () => { live = false; off() }
  }, [])
  return status
}
