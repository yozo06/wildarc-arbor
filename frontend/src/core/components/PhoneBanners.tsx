import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useFarmStatus } from '../phone/useFarmStatus'
import { daysSince, shouldNudge } from '../phone/nudge'
import { saveFarmToFile } from '../phone/saveFarm'
import { clearFarm } from '../data/local/sample'
import { notifyFarmChanged } from '../phone/farmEvents'

// Notes across the top of the phone version: storage the browser is not keeping, the sample farm, and a
// reminder to save when the last save is more than a week old.
export default function PhoneBanners() {
  const farm = useFarmStatus()
  const nav = useNavigate()
  if (!farm) return null

  const save = async () => {
    try { toast.success(`Saved ${await saveFarmToFile()}`) } catch { /* cancelled */ }
  }
  const clearSample = async () => {
    await clearFarm()
    notifyFarmChanged()
    nav('/home', { replace: true })
  }

  const bar = 'mx-4 mt-4 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3'
  return (
    <>
      {farm.storage === 'memory' && (
        <div role="alert" className={`${bar} bg-red-50 text-red-700`}>
          This browser is not keeping your farm. Save it to a file before you close.
          <button onClick={save} className="font-semibold shrink-0">Save now</button>
        </div>
      )}
      {farm.sample && (
        <div className={`${bar} bg-amber-50 text-amber-800`}>
          You are looking at the sample farm.
          <button onClick={clearSample} className="font-semibold shrink-0">Clear sample</button>
        </div>
      )}
      {farm.storage !== 'memory' && shouldNudge(farm) && (
        <div className={`${bar} bg-forest-50 text-forest-800`}>
          {farm.lastSavedAt
            ? `Last saved ${daysSince(farm.lastSavedAt)} days ago.`
            : 'This farm has not been saved to a file yet.'}
          <button onClick={save} className="font-semibold shrink-0">Save now</button>
        </div>
      )}
    </>
  )
}
