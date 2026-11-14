import { useEffect, useState } from 'react'
import { getUsers, createUser, deactivateUser, updateUser } from '../api/users'
import { useAuthStore } from '../../core/store/auth.store'
import toast from 'react-hot-toast'
import { Plus, UserX, Edit2, Check, X, Shield, Pencil, Camera, Eye, UserPlus, RefreshCcw } from 'lucide-react'
import Spinner from '../../core/components/Spinner'

const ROLES = ['admin', 'editor', 'contributor', 'viewer']

export default function Employees() {
  const { isOwner, user } = useAuthStore()
  const [users, setUsers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: '' })
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer', phone: '' })

  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => { getUsers().then(setUsers).finally(() => setLoading(false)) }, [])

  const submit = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('Name, email, password required')
    setSaving(true)
    try {
      const u = await createUser(form)
      setUsers(prev => [...prev, u]); setShowForm(false)
      setForm({ name: '', email: '', password: '', role: 'viewer', phone: '' })
      toast.success(`${u.name} added to project`)
    } catch { toast.error('Failed to add user') }
    finally { setSaving(false) }
  }

  const deactivate = async (id: number, name: string) => {
    if (!confirm(`Remove ${name} from this project?`)) return
    try {
      await deactivateUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success(`${name} removed`)
    } catch { toast.error('Removal failed') }
  }

  const startEdit = (u: any) => {
    setEditingId(u.id)
    setEditForm({ name: u.name, phone: u.phone || '', role: u.role || 'viewer' })
  }

  const saveEdit = async (id: number) => {
    try {
      const updated = await updateUser(id, editForm)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u))
      setEditingId(null)
      toast.success('Member updated')
    } catch { toast.error('Failed to update') }
  }

  const ROLE_CONFIG: Record<string, { color: string, icon: any, label: string }> = {
    admin: { color: 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm', icon: Shield, label: 'Project Admin' },
    editor: { color: 'bg-forest-50 text-forest-700 border-forest-200 shadow-sm', icon: Pencil, label: 'Editor' },
    contributor: { color: 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm', icon: Camera, label: 'Contributor' },
    viewer: { color: 'bg-gray-50 text-gray-600 border-gray-200 shadow-sm', icon: Eye, label: 'Viewer' },
    owner: { color: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm', icon: Shield, label: 'System Owner' },
    employee: { color: 'bg-forest-50 text-forest-700 border-forest-200 shadow-sm', icon: Pencil, label: 'Employee' },
    volunteer: { color: 'bg-gray-50 text-gray-600 border-gray-200 shadow-sm', icon: Eye, label: 'Volunteer' }
  }

  const activeUsers = users.filter(u => u.is_active !== false)
  const inactiveUsers = users.filter(u => u.is_active === false)

  const renderUserCard = (u: any) => {
    const rConfig = ROLE_CONFIG[u.role] || ROLE_CONFIG.viewer
    const Icon = rConfig.icon

    return (
      <div key={u.id} className={`bg-white rounded-3xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100/50 transition-all ${!u.is_active ? 'opacity-50 grayscale' : ''}`}>
        {editingId === u.id ? (
          <div className="space-y-3">
            <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="Full Name" />
            <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="Phone Number" />
            <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest-300">
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            <div className="flex gap-2 pt-2">
              <button onClick={() => saveEdit(u.id)} className="flex-1 bg-forest-600 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-forest-200"><Check size={16} /> Save</button>
              <button onClick={() => setEditingId(null)} aria-label="Cancel editing" className="w-[50px] bg-white border border-gray-200 rounded-xl text-gray-500 flex items-center justify-center hover:bg-gray-50"><X size={18} /></button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="w-12 h-12 rounded-[1rem] bg-forest-50 border border-forest-100/50 flex items-center justify-center text-forest-700 font-display font-bold text-xl flex-shrink-0 shadow-inner">
              {u.name[0]}
            </div>
            <div className="flex-1 min-w-[0px] overflow-hidden">
              <div className="flex justify-between items-start mb-0.5">
                <p className="font-display font-bold text-gray-900 truncate pr-2 text-[15px]">{u.name}</p>
                <div className={`flex items-center gap-1 px-2.5 py-1 ${rConfig.color} rounded-md border flex-shrink-0`}>
                  <Icon size={10} />
                  <span className="text-[9px] uppercase tracking-widest font-bold">{rConfig.label}</span>
                </div>
              </div>
              <p className="text-[12px] font-medium text-gray-500 truncate">{u.email}</p>
              {u.phone && <p className="text-[11px] font-mono text-gray-400 mt-0.5">{u.phone}</p>}
            </div>
          </div>
        )}

        {editingId !== u.id && (isOwner() || u.id === user?.id) && (
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
            <button onClick={() => startEdit(u)} aria-label={`Edit ${u.name}`} className="p-2.5 text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
            {isOwner() && u.id !== user?.id && <button onClick={() => deactivate(u.id, u.name)} aria-label={`Remove ${u.name}`} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><UserX size={16} /></button>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:min-h-0 lg:bg-transparent lg:pb-0">
      <div className="bg-white px-5 pt-14 pb-6 rounded-b-[2.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] mb-6 border-b border-gray-100 sticky top-0 z-40 lg:static lg:px-6 lg:pt-6 lg:rounded-3xl lg:border">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Team Management</h1>
            <p className="text-sm font-medium text-gray-400 mt-1">Manage access to this project.</p>
          </div>
          {isOwner() && (
            <button onClick={() => setShowForm(!showForm)} aria-label={showForm ? 'Close invite form' : 'Invite team member'} className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${showForm ? 'bg-gray-800' : 'bg-forest-600 shadow-forest-200'}`}>
              {showForm ? <X size={24} /> : <Plus size={24} />}
            </button>
          )}
        </div>
      </div>

      <div className="px-5 space-y-6 lg:px-0">
        {showForm && (
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100/50 animate-in slide-in-from-top-4 fade-in lg:max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-forest-50 p-2.5 rounded-xl border border-forest-100/50">
                <UserPlus size={18} className="text-forest-600" />
              </div>
              <h2 className="text-sm font-display font-bold text-gray-800 uppercase tracking-widest">Invite Member</h2>
            </div>

            <div className="space-y-4">
              <input value={form.name} onChange={set('name')} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="Full Name" />
              <input value={form.email} onChange={set('email')} type="email" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="Email Address" />
              <div className="grid grid-cols-2 gap-3 mb-2">
                <input value={form.phone} onChange={set('phone')} className="col-span-2 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="Phone Number (Optional)" />
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 px-1">Project Role</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {ROLES.map(r => (
                    <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                      className={`p-3 rounded-2xl border text-left transition-all ${form.role === r ? 'bg-forest-50 border-forest-300 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                      <p className={`text-xs font-bold capitalize ${form.role === r ? 'text-forest-700' : 'text-gray-700'}`}>{r}</p>
                    </button>
                  ))}
                </div>
              </div>

              <input value={form.password} onChange={set('password')} type="password" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="Temporary Password" />

              <button onClick={submit} disabled={saving} className="w-full bg-gray-900 border border-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-2 hover:bg-black transition-colors shadow-lg shadow-gray-200 active:scale-[0.98] disabled:opacity-50">
                {saving ? <Spinner /> : <><Check size={18} /> Add to Project</>}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 lg:items-start">
          <p className="text-[11px] font-display font-bold text-gray-400 uppercase tracking-widest mb-1 px-1 lg:col-span-2">Active Members ({activeUsers.length})</p>
          {loading ? <div className="mt-8 text-center lg:col-span-2"><Spinner /></div> : activeUsers.length === 0 ? <p className="text-sm text-gray-400 p-4text-center lg:col-span-2">No active members found.</p> : activeUsers.map(renderUserCard)}
        </div>

        {inactiveUsers.length > 0 && (
          <div className="mt-8">
            <button onClick={() => setShowInactive(p => !p)} className="flex items-center gap-2 text-[11px] font-display font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest px-1 py-2 w-full text-left">
              {showInactive ? 'Hide' : 'Show'} Inactive Members ({inactiveUsers.length})
            </button>
            {showInactive && <div className="space-y-4 mt-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 lg:items-start">{inactiveUsers.map(renderUserCard)}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
