import { NavLink } from 'react-router-dom'
import { useNavItems } from './nav'

export default function BottomNav() {
  const items = useNavItems()
  const cls = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 text-xs py-2 px-3 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 ${isActive ? 'text-forest-700 font-semibold' : 'text-gray-400'}`
  return (
    <nav aria-label="Tabs" className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex justify-around px-2 pb-safe z-50 lg:hidden">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={cls}><Icon size={22} /><span>{label}</span></NavLink>
      ))}
    </nav>
  )
}
