import { getStore, readMeta, STORE_NAMES, type StoreName } from './store'
import { replaceFarm, validateFarmData } from './farmFile'
import { getOwner } from './owner'

// The made-up "Sample Food Forest", for trying Arbor without entering anything. It ships in the farm file
// format and loads through the same checks, and it is fetched only when someone asks for it.

export async function loadSampleFarm(): Promise<void> {
  const { default: json } = await import('./sample-farm.json')
  // The sample brings trees, not a person: whoever is using the phone stays who they are.
  const data = { ...validateFarmData(json), owner: await getOwner() }
  await replaceFarm(data, [], { sample: true, startedAt: new Date().toISOString() })
}

/** Empties the farm on this phone (the sample or a real one) but keeps the person's name and details. */
export async function clearFarm(): Promise<void> {
  const owner = await getOwner()
  const empty: Partial<Record<StoreName, unknown[]>> = {}
  for (const s of STORE_NAMES) empty[s] = []
  empty.meta = [
    { key: 'owner', ...owner },
    { key: 'sample', value: false },
    { key: 'startedAt', value: new Date().toISOString() },
  ]
  await (await getStore()).replaceAll(empty)
}

export async function isSampleLoaded(): Promise<boolean> {
  return (await readMeta<boolean>('sample')) === true
}
