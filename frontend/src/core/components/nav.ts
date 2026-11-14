import { LayoutDashboard, TreePine, Map, Users, User, type LucideIcon } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { isLocal } from '../data/mode'

// The one list of places the app's navigation goes. The bottom tab bar (phone) and the sidebar (desktop)
// both draw from it, so the two cannot drift apart.
export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  ownerOnly?: boolean   // only the farm's owner sees it
  serverOnly?: boolean  // not on the phone version, which has no team
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/home', label: 'Home', icon: LayoutDashboard },
  { to: '/trees', label: 'Trees', icon: TreePine },
  { to: '/map', label: 'Map', icon: Map, ownerOnly: true },
  { to: '/employees', label: 'Team', icon: Users, ownerOnly: true, serverOnly: true },
  { to: '/profile', label: 'Me', icon: User },
]

export const navItemsFor = ({ owner, local }: { owner: boolean; local: boolean }): NavItem[] =>
  NAV_ITEMS.filter(i => (!i.ownerOnly || owner) && (!i.serverOnly || !local))

export function useNavItems(): NavItem[] {
  const { isOwner } = useAuthStore()
  return navItemsFor({ owner: isOwner(), local: isLocal() })
}

// Pages that use the whole area beside the sidebar on desktop instead of the centred column.
export const FULL_WIDTH_PATHS = ['/map']

export const isFullWidthPath = (pathname: string): boolean =>
  FULL_WIDTH_PATHS.includes(pathname.replace(/\/+$/, '') || '/')
