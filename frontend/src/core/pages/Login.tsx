import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuthStore } from '../store/auth.store'
import toast from 'react-hot-toast'
import { Leaf } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, setAuth } = useAuthStore()
  const nav = useNavigate()

  useEffect(() => { if (user) nav('/home', { replace: true }) }, [user, nav])

  const submit = async () => {
    if (!email || !pass) return
    setLoading(true)
    try {
      const d = await login(email, pass)
      setAuth(d.user, d.token, d.refreshToken)
    } catch { toast.error('Invalid credentials') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-800 to-forest-600 flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl">
        <Leaf size={32} className="text-forest-600" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-1">Arbor</h1>
      <p className="text-forest-300 text-sm mb-10">Tree Management System</p>
      <div className="w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            placeholder="your@email.com" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Password</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            placeholder="••••••••" />
        </div>
        <button onClick={submit} disabled={loading}
          className="w-full bg-forest-600 text-white font-semibold py-3.5 rounded-xl active:scale-95 transition-transform disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="text-center text-sm text-gray-500 pt-2">
          Don't have an account? <Link to="/signup" className="text-forest-600 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
