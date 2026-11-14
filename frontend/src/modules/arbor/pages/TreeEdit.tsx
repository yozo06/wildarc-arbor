import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTree, updateTree } from '../api/trees'
import { getSpecies, getZones } from '../api/species'
import { getUsers } from '../../../settings/api/users'
import toast from 'react-hot-toast'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Spinner from '../../../core/components/Spinner'
import { deleteTree } from '../api/trees'

export default function TreeEdit() {
    const { code } = useParams()
    const nav = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [species, setSpecies] = useState<any[]>([])
    const [zones, setZones] = useState<any[]>([])
    const [employees, setEmployees] = useState<any[]>([])

    const [form, setForm] = useState({
        custom_common_name: '',
        species_id: '',
        zone_id: '',
        action: 'pending',
        priority: 'medium',
        status: 'pending',
        health_score: '',
        approx_age_yrs: '',
        height_m: '',
        trunk_diameter_cm: '',
        coord_x: '',
        coord_y: '',
        action_notes: '',
        public_notes: '',
        planting_date: '',
        assigned_to: '',
    })

    useEffect(() => {
        Promise.all([getTree(code!), getSpecies(), getZones(), getUsers()]).then(([tree, s, z, u]) => {
            setSpecies(s)
            setZones(z)
            setEmployees(u.filter((u: any) => u.role === 'employee' || u.role === 'volunteer'))
            // Populate form from existing tree data
            setForm({
                custom_common_name: tree.custom_common_name || '',
                species_id: tree.species_id || '',
                zone_id: tree.zone_id || '',
                action: tree.action || 'pending',
                priority: tree.priority || 'medium',
                status: tree.status || 'pending',
                health_score: tree.health_score ?? '',
                approx_age_yrs: tree.approx_age_yrs ?? '',
                height_m: tree.height_m ?? '',
                trunk_diameter_cm: tree.trunk_diameter_cm ?? '',
                coord_x: tree.coord_x ?? '',
                coord_y: tree.coord_y ?? '',
                action_notes: tree.action_notes || '',
                public_notes: tree.public_notes || '',
                planting_date: tree.planting_date ? tree.planting_date.split('T')[0] : '',
                assigned_to: tree.assigned_to || '',
            })
        }).finally(() => setLoading(false))
    }, [code])

    const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }))

    const submit = async () => {
        setSaving(true)
        try {
            const payload: any = { ...form }
            // Remove empty strings so they don't overwrite existing data with null
            Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k] })
            await updateTree(code!, payload)
            toast.success('Tree updated!')
            nav(`/trees/${code}`)
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to update tree')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Permanently delete tree ${code}? This cannot be undone.`)) return
        try {
            await deleteTree(code!)
            toast.success(`Tree ${code} deleted`)
            nav('/trees', { replace: true })
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to delete tree')
        }
    }

    if (loading) return <Spinner label="Loading tree…" />

    return (
        <div className="px-4 pt-12 pb-8 lg:px-0 lg:pt-0 lg:pb-0 lg:max-w-3xl">
            <button onClick={() => nav(-1)} className="mb-4 flex items-center gap-1 text-gray-500">
                <ArrowLeft size={16} /> Back
            </button>

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Edit Tree <span className="font-mono text-forest-600">{code}</span></h1>
                <button onClick={handleDelete} aria-label="Delete tree"
                    className="w-11 h-11 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center text-red-500 active:scale-95 transition-transform">
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-5 lg:space-y-0 lg:items-end">
                <div className="lg:col-span-2">
                    <Field label="Custom Name (overrides species name)" k="custom_common_name" form={form} onChange={set('custom_common_name')} placeholder="Leave blank to use species name" />
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Species</label>
                    <select value={form.species_id} onChange={set('species_id')}
                        className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300">
                        <option value="">Select species…</option>
                        {species.map(s => <option key={s.id} value={s.id}>{s.common_name} — {s.scientific_name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Zone</label>
                    <select value={form.zone_id} onChange={set('zone_id')}
                        className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300">
                        <option value="">Select zone…</option>
                        {zones.map(z => <option key={z.id} value={z.id}>{z.zone_name} ({z.zone_code})</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Select label="Action" k="action" form={form} onChange={set('action')}
                        options={['pending', 'cut', 'trim', 'keep', 'monitor', 'treat', 'replant'].map(a => ({ value: a, label: a }))} />
                    <Select label="Priority" k="priority" form={form} onChange={set('priority')}
                        options={['low', 'medium', 'high', 'urgent'].map(p => ({ value: p, label: p }))} />
                </div>

                <Select label="Status" k="status" form={form} onChange={set('status')}
                    options={['pending', 'in_progress', 'completed', 'on_hold'].map(s => ({ value: s, label: s.replace('_', ' ') }))} />

                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Assign to Employee</label>
                    <select value={form.assigned_to} onChange={set('assigned_to')}
                        className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300">
                        <option value="">Unassigned</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Field label="Health (1-10)" k="health_score" type="number" min="1" max="10" form={form} onChange={set('health_score')} />
                    <Field label="Age (yrs)" k="approx_age_yrs" type="number" form={form} onChange={set('approx_age_yrs')} />
                    <Field label="Height (m)" k="height_m" type="number" step="0.1" form={form} onChange={set('height_m')} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Trunk ⌀ (cm)" k="trunk_diameter_cm" type="number" form={form} onChange={set('trunk_diameter_cm')} />
                    <Field label="Planting Date" k="planting_date" type="date" form={form} onChange={set('planting_date')} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="X Coord (m)" k="coord_x" type="number" step="0.001" form={form} onChange={set('coord_x')} />
                    <Field label="Y Coord (m)" k="coord_y" type="number" step="0.001" form={form} onChange={set('coord_y')} />
                </div>

                <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">Action Notes (for employees)</label>
                    <textarea value={form.action_notes} onChange={set('action_notes')}
                        className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                        rows={3} placeholder="Instructions for field workers…" />
                </div>

                <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">Public Notes (shown on QR scan)</label>
                    <textarea value={form.public_notes} onChange={set('public_notes')}
                        className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                        rows={2} placeholder="Visible to anyone who scans the QR tag…" />
                </div>

                <button onClick={submit} disabled={saving}
                    className="w-full bg-forest-600 text-white font-semibold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-60 mt-2 lg:col-span-2 lg:justify-self-start lg:w-auto lg:px-10 lg:py-3 lg:mt-0">
                    {saving ? 'Saving…' : '💾 Save Changes'}
                </button>
            </div>
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

const Select = ({ label, k, form, onChange, options }: { label: string; k: string; form: any; onChange: any; options: { value: string; label: string }[] }) => (
    <div>
        <label className="text-xs font-medium text-gray-500 uppercase">{label}</label>
        <select value={(form as any)[k]} onChange={onChange}
            className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300">
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
)
