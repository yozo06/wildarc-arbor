import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../../core/api/auth'
import { updateUser } from '../api/users'
import { isLocal } from '../../core/data/mode'
import { useAuthStore } from '../../core/store/auth.store'
import toast from 'react-hot-toast'
import { LogOut, Lock, Edit2, Check } from 'lucide-react'

export default function Profile() {
  const { user, logout, setUser } = useAuthStore()
  const nav = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [curr, setCurr] = useState(''); const [next, setNext] = useState('')
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ name: user?.name || '', phone: (user as any)?.phone || '', bio: (user as any)?.bio || '' })

  const doLogout = () => { logout(); nav('/login', { replace: true }) }

  const submitPw = async () => {
    if (!curr || !next) return
    setSaving(true)
    try { await changePassword(curr, next); toast.success('Password changed'); setShowPw(false); setCurr(''); setNext('') }
    finally { setSaving(false) }
  }

  const submitEdit = async () => {
    if (!editForm.name.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      const updated = await updateUser(user!.id, editForm)
      setUser({ ...user!, ...updated })
      toast.success('Profile updated')
      setShowEdit(false)
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  const ROLE_COLOR: Record<string, string> = { owner: 'bg-forest-100 text-forest-700', employee: 'bg-blue-100 text-blue-700', volunteer: 'bg-purple-100 text-purple-700' }

  return (
    <div className="px-4 pt-12 pb-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-2xl mb-3">{user?.name[0]}</div>
        <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
        <p className="text-sm text-gray-400 mb-2">{user?.email}</p>
        <span className={`text-xs px-3 py-1 rounded-full capitalize ${ROLE_COLOR[user?.role || 'employee']}`}>{user?.role}</span>
      </div>
      <div className="space-y-3">
        <button onClick={() => setShowEdit(f => !f)} className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left active:scale-95 transition-transform">
          <Edit2 size={18} className="text-gray-400" /><span className="font-medium text-gray-700">Edit Profile</span>
        </button>
        {showEdit && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <div><label className="text-xs text-gray-500 uppercase font-medium">Name</label>
              <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div><label className="text-xs text-gray-500 uppercase font-medium">Phone</label>
              <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="+91 98765 43210" />
            </div>
            <div><label className="text-xs text-gray-500 uppercase font-medium">Bio</label>
              <textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} rows={2}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="Brief description about yourself…" />
            </div>
            <button onClick={submitEdit} disabled={saving} className="w-full bg-forest-600 text-white font-semibold py-3 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
              <Check size={16} />{saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        )}
        {/* The phone version has no password and nobody to sign out to. */}
        {!isLocal() && (<>
          <button onClick={() => setShowPw(f => !f)} className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left active:scale-95 transition-transform">
            <Lock size={18} className="text-gray-400" /><span className="font-medium text-gray-700">Change Password</span>
          </button>
          {showPw && (
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <input type="password" value={curr} onChange={e => setCurr(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="Current password" />
              <input type="password" value={next} onChange={e => setNext(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="New password" />
              <button onClick={submitPw} disabled={saving} className="w-full bg-forest-600 text-white font-semibold py-3 rounded-xl disabled:opacity-60">{saving ? 'Saving…' : 'Update Password'}</button>
            </div>
          )}
          <button onClick={doLogout} className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600 font-medium active:scale-95 transition-transform">
            <LogOut size={18} />Sign Out
          </button>
        </>)}
      </div>
    </div>
  )
}
