import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Download, FolderOpen, Smartphone } from 'lucide-react'
import { readFarmFile } from '../../core/data/local/farmFile'
import { readMeta } from '../../core/data/local/store'
import { canPromptInstall, onInstallAvailable, promptInstall } from '../../core/phone/install'
import { saveFarmToFile } from '../../core/phone/saveFarm'
import { notifyFarmChanged, onFarmChanged } from '../../core/phone/farmEvents'

type Opened = Awaited<ReturnType<typeof readFarmFile>>

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })

// "Your farm" on the Me page of the phone version: save the farm to a file, open one, install the app.
export default function FarmFileCard() {
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>()
  const [opened, setOpened] = useState<Opened | null>(null)
  const [canInstall, setCanInstall] = useState(canPromptInstall())
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = () => { readMeta<string>('lastSavedAt').then(setLastSavedAt) }
    load()
    const offFarm = onFarmChanged(load)
    const offInstall = onInstallAvailable(() => setCanInstall(true))
    return () => { offFarm(); offInstall() }
  }, [])

  const save = async () => {
    setBusy(true)
    try { toast.success(`Saved ${await saveFarmToFile()}`) } catch { /* cancelled */ }
    finally { setBusy(false) }
  }

  const choose = async (file: File | undefined) => {
    if (!file) return
    try { setOpened(await readFarmFile(file)) }
    catch (err: any) { toast.error(err?.response?.data?.error ?? 'This is not an Arbor farm file.') }
    finally { if (input.current) input.current.value = '' }
  }

  const replace = async () => {
    if (!opened) return
    setBusy(true)
    try {
      await opened.apply()
      setOpened(null)
      notifyFarmChanged()
      toast.success('Farm opened')
    } catch {
      toast.error('The farm could not be opened. Nothing on this phone was changed.')
    } finally {
      setBusy(false)
    }
  }

  const row = 'w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left active:scale-95 transition-transform'
  return (
    <section aria-label="Your farm" className="space-y-3 mb-4 lg:col-start-2 lg:row-start-2">
      <div className="px-1">
        <h2 className="font-semibold text-gray-800">Your farm</h2>
        <p className="text-sm text-gray-500">{lastSavedAt ? `Last saved ${longDate(lastSavedAt)}` : 'Not saved yet'}</p>
      </div>
      <button onClick={save} disabled={busy} className={row}>
        <Download size={18} className="text-gray-400" /><span className="font-medium text-gray-700">Save my farm</span>
      </button>
      <label className={`${row} cursor-pointer`}>
        <FolderOpen size={18} className="text-gray-400" />
        <span className="font-medium text-gray-700">Open a farm file</span>
        <input ref={input} type="file" accept=".zip,application/zip" className="sr-only"
          onChange={e => choose(e.target.files?.[0])} />
      </label>
      {opened && (
        <div role="dialog" aria-label="Open this farm file?" className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-sm text-gray-800">
            {opened.summary.trees} trees, {opened.summary.photos} photos, saved {longDate(opened.summary.savedAt)}.
          </p>
          <p className="text-sm text-gray-500">This replaces the farm on this phone.</p>
          <div className="flex gap-2">
            <button onClick={replace} disabled={busy} className="flex-1 bg-forest-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-60">Replace my farm</button>
            <button onClick={() => setOpened(null)} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl">Cancel</button>
          </div>
        </div>
      )}
      {canInstall && (
        <button onClick={() => { void promptInstall() }} className={row}>
          <Smartphone size={18} className="text-gray-400" /><span className="font-medium text-gray-700">Install app</span>
        </button>
      )}
    </section>
  )
}
