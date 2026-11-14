import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { client } from '../api/client'
import toast from 'react-hot-toast'
import { TreePine } from 'lucide-react'

export default function Signup() {
    const nav = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const { setAuth, user } = useAuthStore()

    useEffect(() => {
        if (user) nav('/home', { replace: true })
    }, [user, nav])

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) return toast.error('All fields are required')
        setLoading(true)
        try {
            const { data } = await client.post('/auth/signup', form)
            setAuth(data.user, data.token, data.refreshToken)
            toast.success('Account created successfully!')
            nav('/home')
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Signup failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-forest-50 flex flex-col justify-center px-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[50%] bg-forest-600 rounded-b-[100%] z-0" />
            <div className="relative z-10 w-full max-w-sm mx-auto lg:max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl rotate-3">
                        <TreePine size={40} className="text-forest-600" />
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/50">
                    <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Create Account</h1>
                    <p className="text-sm text-center text-gray-500 mb-8 font-medium">Join the Tree Management System</p>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full mt-1.5 px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all font-medium"
                                placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full mt-1.5 px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all font-medium"
                                placeholder="you@email.com" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full mt-1.5 px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all font-medium"
                                placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-forest-600 text-white font-semibold py-4 rounded-2xl mt-6 active:scale-[0.98] transition-all shadow-lg shadow-forest-600/30 disabled:opacity-70">
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account? <Link to="/login" className="text-forest-600 font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
