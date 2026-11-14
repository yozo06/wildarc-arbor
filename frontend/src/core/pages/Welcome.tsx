import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { TreePine, Share, PlusSquare, Smartphone } from 'lucide-react'
import { canPromptInstall, isInstalled, isIos, onInstallAvailable, promptInstall } from '../phone/install'
import { clearFarm, isSampleLoaded, loadSampleFarm } from '../data/local/sample'
import { writeMeta } from '../data/local/store'
import { notifyFarmChanged } from '../phone/farmEvents'
import { useFarmStatus } from '../phone/useFarmStatus'

// The first screen of the phone version. On iPhone it asks people to add Arbor to the Home Screen before they
// enter anything, because a farm started in a Safari tab stays in Safari and can be deleted after a week.
export default function Welcome() {
  const nav = useNavigate()
  const needsHomeScreen = isIos() && !isInstalled()
  const [inSafariAnyway, setInSafariAnyway] = useState(false)
  const [canInstall, setCanInstall] = useState(canPromptInstall())
  const [busy, setBusy] = useState(false)

  const farm = useFarmStatus()

  useEffect(() => onInstallAvailable(() => setCanInstall(true)), [])

  const go = async (work: () => Promise<void>) => {
    setBusy(true)
    try {
      await work()
      notifyFarmChanged()
      nav('/home', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  const startFarm = () => go(async () => {
    if (await isSampleLoaded()) await clearFarm()
    else await writeMeta('startedAt', new Date().toISOString())
  })
  const lookAround = () => go(loadSampleFarm)

  const showStart = !needsHomeScreen || inSafariAnyway

  // Reached with a real farm already on the phone (an old bookmark, a typed address): go home, so the sample can
  // never replace that farm.
  if (farm?.started && farm.treeCount > 0 && !farm.sample) return <Navigate to="/home" replace />

  return (
    <div className="min-h-screen bg-brand-offwhite max-w-md mx-auto px-6 pt-16 pb-10 flex flex-col lg:max-w-5xl lg:px-12 lg:py-16 lg:grid lg:grid-cols-2 lg:grid-rows-[1fr_auto_auto_auto_1fr] lg:gap-x-20">
      <div className="w-14 h-14 rounded-2xl bg-forest-600 text-white flex items-center justify-center mb-6 lg:col-start-1 lg:row-start-2 lg:w-16 lg:h-16 lg:mb-8">
        <TreePine size={30} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2 lg:col-start-1 lg:row-start-3 lg:text-6xl lg:mb-5">Arbor</h1>
      <p className="text-gray-600 mb-8 lg:col-start-1 lg:row-start-4 lg:text-xl lg:leading-relaxed lg:mb-0">
        Every tree on your farm, in your pocket. Your farm stays on this device: no account, no server.
      </p>

      {needsHomeScreen && !inSafariAnyway && (
        <section className="bg-white rounded-2xl p-5 shadow-sm mb-6 lg:col-start-2 lg:row-start-1 lg:row-span-5 lg:self-center lg:p-8 lg:mb-0">
          <h2 className="font-semibold text-gray-900 mb-3">Add Arbor to your Home Screen first</h2>
          <ol className="space-y-2 text-sm text-gray-700 mb-4">
            <li className="flex items-center gap-2"><Share size={16} className="text-forest-600" />Tap the Share button.</li>
            <li className="flex items-center gap-2"><PlusSquare size={16} className="text-forest-600" />Choose Add to Home Screen.</li>
            <li className="flex items-center gap-2"><Smartphone size={16} className="text-forest-600" />Open Arbor from your Home Screen.</li>
          </ol>
          <p className="text-xs text-gray-500 mb-4">
            A farm started in Safari stays in Safari, and Safari can delete it after a week without a visit.
          </p>
          <button onClick={() => setInSafariAnyway(true)} className="text-sm font-medium text-forest-700 underline">
            Continue in Safari anyway
          </button>
        </section>
      )}

      {showStart && (
        <div className="space-y-3 lg:col-start-2 lg:row-start-1 lg:row-span-5 lg:self-center">
          {canInstall && (
            <button onClick={() => { void promptInstall() }} className="w-full border border-forest-600 text-forest-700 font-semibold py-3 rounded-xl">
              Install app
            </button>
          )}
          <button onClick={startFarm} disabled={busy} className="w-full bg-forest-600 text-white font-semibold py-3 rounded-xl disabled:opacity-60">
            Start my farm
          </button>
          <button onClick={lookAround} disabled={busy} className="w-full bg-white text-forest-700 font-semibold py-3 rounded-xl shadow-sm disabled:opacity-60">
            Look around the sample farm
          </button>
          <p className="text-xs text-gray-500 pt-2">You can save your farm to a file at any time, from Me.</p>
        </div>
      )}
    </div>
  )
}
