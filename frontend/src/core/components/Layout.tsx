import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import BottomNav from './BottomNav'
import { useAuthStore } from '../store/auth.store'

export default function Layout() {
  const { user } = useAuthStore()
  return (
    <div className="min-h-screen bg-brand-offwhite flex flex-col max-w-md mx-auto border-x border-brand-night/10 relative">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <main className="flex-1 overflow-y-auto pb-20"><Outlet /></main>
      {user && <BottomNav />}
    </div>
  )
}
