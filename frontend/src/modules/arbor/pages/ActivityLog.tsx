import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getActivity, addActivity } from '../api/trees'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus } from 'lucide-react'

const ACTIONS = ['trimmed','cut_down','treated','replanted','watered','health_checked','photo_added','other']

export default function ActivityLog() {
  const { code } = useParams(); const nav = useNavigate()
  const [log, setLog] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [action, setAction] = useState('trimmed')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { getActivity(code!).then(setLog) }, [code])
  const submit = async () => {
    setSaving(true)
    try {
      const entry = await addActivity(code!, action, notes||undefined)
      setLog(prev => [entry, ...prev]); setShowForm(false); setNotes('')
      toast.success('Activity logged')
    } finally { setSaving(false) }
  }
  return (
    <div className="px-4 pt-12 pb-8 lg:px-0 lg:pt-0 lg:pb-0 lg:max-w-3xl lg:mx-auto">
      <button onClick={() => nav(-1)} className="mb-4 flex items-center gap-1 text-gray-500"><ArrowLeft size={16} /> Back</button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Activity — {code}</h1>
        <button onClick={() => setShowForm(f=>!f)} aria-label="Add activity" className="w-11 h-11 bg-forest-600 rounded-xl flex items-center justify-center text-white"><Plus size={18} /></button>
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 space-y-3 lg:p-6 lg:mb-6">
          <select value={action} onChange={e=>setAction(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300">
            {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g,' ')}</option>)}
          </select>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" rows={2} placeholder="Details…" />
          <button onClick={submit} disabled={saving} className="w-full bg-forest-600 text-white font-semibold py-3 rounded-xl disabled:opacity-60 lg:w-auto lg:px-8">{saving?'Logging…':'Log Activity'}</button>
        </div>
      )}
      <div className="space-y-2">
        {log.map(l => (
          <div key={l.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-3">
            <div className="w-2 h-2 rounded-full bg-forest-400 mt-1.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm text-gray-800 capitalize">{l.action_taken.replace(/_/g,' ')}</p>
                <p className="text-xs text-gray-400">{format(new Date(l.logged_at),'dd MMM')}</p>
              </div>
              {(l.previous_status||l.new_status) && <p className="text-xs text-gray-400 mt-0.5">{l.previous_status} → {l.new_status}</p>}
              {l.notes && <p className="text-sm text-gray-600 mt-1">{l.notes}</p>}
              {l.users && <p className="text-xs text-gray-400 mt-1">— {l.users.name}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
