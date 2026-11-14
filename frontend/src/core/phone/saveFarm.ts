import { exportFarm, markSaved } from '../data/local/farmFile'
import { downloadBlob } from './download'
import { notifyFarmChanged } from './farmEvents'

/** Saves the whole farm to a file and, once it has left the phone, records the save. Returns the file name. */
export async function saveFarmToFile(): Promise<string> {
  const { blob, filename, savedAt } = await exportFarm()
  await downloadBlob(blob, filename)
  await markSaved(savedAt)
  notifyFarmChanged()
  return filename
}
