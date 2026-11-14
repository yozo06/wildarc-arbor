import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getHealth, addHealth } from '../api/trees'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus } from 'lucide-react'

export default function HealthLog() {
  const { code } = useParams(); const nav = useNavigate()
  const [obs, setObs] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ health_score:'', leaf_color:'', bark_condition:'', pest_presence:false, disease_signs:false, height_m:'', additional_notes:'' })
  useEffect(() => { getHealth(code!).then(setObs) }, [code])
  const set = (k: string) => (e: React.ChangeEvent<any>) =>
    setForm(f => ({...f,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value}))
  const submit = async () => {
    setSaving(true)
    try {
      const payload: any = {...form}
      Object.keys(payload).forEach(k => payload[k]==='' && delete payload[k])
      const created = await addHealth(code!, payload)
      setObs(prev => [created, ...prev]); setShowForm(false)
      toast.success('Observation saved')
    } finally { setSaving(false) }
  }
  return (
    <div className="px-4 pt-12 pb-8 lg:px-0 lg:pt-0 lg:pb-0 lg:max-w-3xl lg:mx-auto">
      <button onClick={() => nav(-1)} className="mb-4 flex items-center gap-1 text-gray-500"><ArrowLeft size={16} /> Back</button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Health Log — {code}</h1>
        <button onClick={() => setShowForm(f=>!f)} aria-label="Add health observation" className="w-11 h-11 bg-forest-600 rounded-xl flex items-center justify-center text-white"><Plus size={18} /></button>
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 space-y-3 lg:p-6 lg:mb-6">
          <p className="font-semibold text-gray-700">New Observation</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Health Score (1-10)</label><input type="number" min="1" max="10" value={form.health_score} onChange={set('health_score')} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" /></div>
            <div><label className="text-xs text-gray-500">Height (m)</label><input type="number" step="0.1" value={form.height_m} onChange={set('height_m')} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Leaf Color</label>
              <select value={form.leaf_color} onChange={set('leaf_color')} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                <option value="">—</option>
                {['healthy_green','pale','yellowing','browning','spots','fallen_early'].map(v => <option key={v} value={v}>{v.replace('_',' ')}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500">Bark</label>
              <select value={form.bark_condition} onChange={set('bark_condition')} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                <option value="">—</option>
                {['healthy','cracked','peeling','fungal','insect_damage','scarred'].map(v => <option key={v} value={v}>{v.replace('_',' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.pest_presence} onChange={set('pest_presence')} className="w-5 h-5 min-w-[20px]" />Pests present</label>
            <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.disease_signs} onChange={set('disease_signs')} className="w-5 h-5 min-w-[20px]" />Disease signs</label>
          </div>
          <textarea value={form.additional_notes} onChange={set('additional_notes')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" rows={2} placeholder="Additional notes…" />
          <button onClick={submit} disabled={saving} className="w-full bg-forest-600 text-white font-semibold py-3 rounded-xl disabled:opacity-60 lg:w-auto lg:px-8">{saving?'Saving…':'Save Observation'}</button>
        </div>
      )}
      <div className="space-y-3">
        {obs.map(o => (
          <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">{format(new Date(o.observed_at),'dd MMM yyyy, HH:mm')}</p>
              {o.health_score && <span className={`text-sm font-bold ${o.health_score>=7?'text-green-600':o.health_score>=4?'text-yellow-600':'text-red-600'}`}>{o.health_score}/10</span>}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {o.leaf_color && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">{o.leaf_color.replace('_',' ')}</span>}
              {o.bark_condition && <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full capitalize">{o.bark_condition.replace('_',' ')}</span>}
              {o.pest_presence && <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full">⚠️ Pests</span>}
              {o.disease_signs && <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full">🦠 Disease</span>}
            </div>
            {o.additional_notes && <p className="text-sm text-gray-600 mt-2">{o.additional_notes}</p>}
            {o.users && <p className="text-xs text-gray-400 mt-1.5">— {o.users.name}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
