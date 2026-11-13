import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TreePine, Map, Users, User } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'

export default function BottomNav() {
  const { isOwner } = useAuthStore()
  const cls = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 text-xs py-2 px-3 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 ${isActive ? 'text-forest-700 font-semibold' : 'text-gray-400'}`
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex justify-around px-2 pb-safe z-50">
      <NavLink to="/home" className={cls}><LayoutDashboard size={22} /><span>Home</span></NavLink>
      <NavLink to="/trees" className={cls}><TreePine size={22} /><span>Trees</span></NavLink>
      {isOwner() && <NavLink to="/map" className={cls}><Map size={22} /><span>Map</span></NavLink>}
      {isOwner() && <NavLink to="/employees" className={cls}><Users size={22} /><span>Team</span></NavLink>}
      <NavLink to="/profile" className={cls}><User size={22} /><span>Me</span></NavLink>
    </nav>
  )
}
