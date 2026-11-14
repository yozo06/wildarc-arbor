import { NavLink } from 'react-router-dom'
import { useNavItems } from './nav'

// The desktop navigation: a fixed column down the left edge from 1024px up. Below that it is hidden and the
// bottom tab bar is used instead.
export default function SideNav() {
  const items = useNavItems()
  const cls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 ${isActive ? 'bg-brand-forest-light text-brand-forest font-semibold' : 'text-brand-muted hover:bg-brand-night/5 hover:text-brand-night'}`
  return (
    <nav aria-label="Sidebar" className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col bg-white border-r border-brand-night/10 z-40">
      <div className="flex items-center gap-3 px-5 h-16 shrink-0">
        <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" className="w-8 h-8 rounded-lg" />
        <span className="text-lg font-bold text-brand-night">Arbor</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={cls}><Icon size={20} className="shrink-0" /><span>{label}</span></NavLink>
        ))}
      </div>
    </nav>
  )
}
