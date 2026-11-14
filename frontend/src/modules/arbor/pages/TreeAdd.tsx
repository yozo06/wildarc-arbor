import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTree } from '../api/trees'
import { getSpecies, getZones } from '../api/species'
import { getUsers } from '../../../settings/api/users'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus } from 'lucide-react'
import SpeciesModal from '../components/SpeciesModal'
import ZoneModal from '../components/ZoneModal'
import MapPicker from '../components/MapPicker'
import { getMapTrees } from '../api/map'

export default function TreeAdd() {
  const nav = useNavigate()
  const [species, setSpecies] = useState<any[]>([])
  const [zones, setZones] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [showSpeciesModal, setShowSpeciesModal] = useState(false)
  const [showZoneModal, setShowZoneModal] = useState(false)
  const [allTrees, setAllTrees] = useState<any[]>([])

  const [form, setForm] = useState({
    tree_code: '', species_id: '', zone_id: '', action: 'pending', priority: 'medium',
    health_score: '', approx_age_yrs: '', height_m: '', trunk_diameter_cm: '',
    coord_x: '', coord_y: '', action_notes: '', public_notes: '', planting_date: '', assigned_to: ''
  })
  useEffect(() => {
    Promise.all([getSpecies(), getZones(), getUsers(), getMapTrees()]).then(([s, z, u, t]) => {
      setSpecies(s); setZones(z); setEmployees(u.filter((u: any) => u.role === 'employee'))
      setAllTrees(t)
    })
  }, [])
  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async () => {
    if (!form.tree_code) return toast.error('Tree code required')
    setSaving(true)
    try {
      const payload: any = { ...form }
      Object.keys(payload).forEach(k => payload[k] === '' && delete payload[k])
      await createTree(payload)
      toast.success(`Tree ${form.tree_code} added!`)
      nav('/trees')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add tree')
    } finally { setSaving(false) }
  }

  return (
    <div className="px-4 pt-12 pb-8 lg:px-0 lg:pt-0 lg:pb-0 lg:max-w-3xl">
      <button onClick={() => nav(-1)} className="mb-4 flex items-center gap-1 text-gray-500"><ArrowLeft size={16} /> Back</button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Tree</h1>
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-5 lg:space-y-0 lg:items-end">
        <Field label="Tree Code *" k="tree_code" form={form} onChange={set('tree_code')} placeholder="e.g. T-042" />
        <div>
          <div className="flex justify-between items-center bg-transparent">
            <label className="text-xs font-medium text-gray-500 uppercase">Species</label>
            <button onClick={() => setShowSpeciesModal(true)} type="button" className="text-[11px] font-semibold text-forest-600 flex items-center gap-1 hover:text-forest-700 bg-transparent border-none cursor-pointer"><Plus size={12} /> New Species</button>
          </div>
          <select value={form.species_id} onChange={set('species_id')} className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300">
            <option value="">Select species…</option>
            {species.map(s => <option key={s.id} value={s.id}>{s.common_name} — {s.scientific_name}</option>)}
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center bg-transparent">
            <label className="text-xs font-medium text-gray-500 uppercase">Zone</label>
            <button onClick={() => setShowZoneModal(true)} type="button" className="text-[11px] font-semibold text-forest-600 flex items-center gap-1 hover:text-forest-700 bg-transparent border-none cursor-pointer"><Plus size={12} /> New Zone</button>
          </div>
          <select value={form.zone_id} onChange={set('zone_id')} className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300">
            <option value="">Select zone…</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.zone_name} ({z.zone_code})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Action</label>
            <select value={form.action} onChange={set('action')} className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
              {['pending', 'cut', 'trim', 'keep', 'monitor', 'treat', 'replant'].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Priority</label>
            <select value={form.priority} onChange={set('priority')} className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
              {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Assign to Employee</label>
          <select value={form.assigned_to} onChange={set('assigned_to')} className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
            <option value="">Unassigned</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Health (1-10)" k="health_score" type="number" min="1" max="10" form={form} onChange={set('health_score')} />
          <Field label="Age (yrs)" k="approx_age_yrs" type="number" form={form} onChange={set('approx_age_yrs')} />
          <Field label="Height (m)" k="height_m" type="number" step="0.1" form={form} onChange={set('height_m')} />
        </div>
        <div className="lg:col-span-2">
          <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Location Coordinates</label>
          <MapPicker
            trees={allTrees}
            value={form.coord_x ? { x: Number(form.coord_x), y: Number(form.coord_y) } : undefined}
            onChange={(x: any, y: any) => setForm(f => ({ ...f, coord_x: x.toString(), coord_y: y.toString() }))}
          />
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Field label="X Coord (m)" k="coord_x" type="number" step="0.001" form={form} onChange={set('coord_x')} />
            <Field label="Y Coord (m)" k="coord_y" type="number" step="0.001" form={form} onChange={set('coord_y')} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <label className="text-xs font-medium text-gray-500 uppercase">Action Notes (for employees)</label>
          <textarea value={form.action_notes} onChange={set('action_notes')}
            className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
            rows={3} placeholder="e.g. Trim from the east side only…" />
        </div>
        <div className="lg:col-span-2">
          <label className="text-xs font-medium text-gray-500 uppercase">Public Notes (shown on QR scan)</label>
          <textarea value={form.public_notes} onChange={set('public_notes')}
            className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
            rows={2} placeholder="Visible to anyone who scans the QR tag…" />
        </div>
        <Field label="Planting Date" k="planting_date" type="date" form={form} onChange={set('planting_date')} />
        <button onClick={submit} disabled={saving}
          className="w-full bg-forest-600 text-white font-semibold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-60 mt-2 lg:col-span-2 lg:justify-self-start lg:w-auto lg:px-10 lg:py-3 lg:mt-0">
          {saving ? 'Saving…' : '🌱 Add Tree'}
        </button>
      </div>

      {showSpeciesModal && (
        <SpeciesModal
          onClose={() => setShowSpeciesModal(false)}
          onSuccess={(s: any) => {
            setSpecies(prev => [...prev, s])
            setForm(f => ({ ...f, species_id: s.id }))
          }}
        />
      )}
      {showZoneModal && (
        <ZoneModal
          onClose={() => setShowZoneModal(false)}
          onSuccess={(z: any) => {
            setZones(prev => [...prev, z])
            setForm(f => ({ ...f, zone_id: z.id }))
          }}
        />
      )}
    </div>
  )
}

const Field = ({ label, k, form, onChange, type = 'text', ...rest }: any) => (
  <div>
    <label className="text-xs font-medium text-gray-500 uppercase">{label}</label>
    <input type={type} value={(form as any)[k]} onChange={onChange}
      className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" {...rest} />
  </div>
)

