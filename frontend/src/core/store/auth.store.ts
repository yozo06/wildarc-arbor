import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isLocal } from '../data/mode'

interface User { id: number; name: string; email: string; role: string }
interface AuthState {
  user: User | null; token: string | null; refreshToken: string | null
  activeProjectId: string | null
  setAuth: (user: User, token: string, refreshToken: string) => void
  setUser: (user: User) => void
  setActiveProject: (projectId: string) => void
  logout: () => void
  isOwner: () => boolean
  isEmployee: () => boolean
  isVolunteer: () => boolean
}

// On the phone version there is no sign-in: whoever holds the phone is user 1, the farm's owner. Signing out
// returns to that person, so the route guards never send the phone version to a sign-in page.
const PHONE_OWNER: User = { id: 1, name: 'You', email: '', role: 'owner' }
const SIGNED_OUT = isLocal()
  ? { user: PHONE_OWNER, token: 'local', refreshToken: null }
  : { user: null, token: null, refreshToken: null }

export const useAuthStore = create<AuthState>()(
  persist((set, get) => ({
    ...SIGNED_OUT, activeProjectId: null,
    setAuth: (user, token, refreshToken) => {
      localStorage.setItem('tms_token', token)
      localStorage.setItem('tms_refresh', refreshToken)
      set({ user, token, refreshToken })
    },
    setUser: (user) => set({ user }),
    setActiveProject: (projectId) => set({ activeProjectId: projectId }),
    logout: () => {
      localStorage.removeItem('tms_token')
      localStorage.removeItem('tms_refresh')
      set({ ...SIGNED_OUT, activeProjectId: null })
    },
    isOwner: () => get().user?.role === 'owner',
    isEmployee: () => get().user?.role === 'employee',
    isVolunteer: () => get().user?.role === 'volunteer',
  }), { name: isLocal() ? 'arbor_phone_auth' : 'tms_auth' })
)
