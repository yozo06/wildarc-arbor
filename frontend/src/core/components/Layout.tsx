import { Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import BottomNav from './BottomNav'
import SideNav from './SideNav'
import { isFullWidthPath } from './nav'
import { useAuthStore } from '../store/auth.store'
import { isLocal } from '../data/mode'
import PhoneBanners from './PhoneBanners'

// The app shell. Below 1024px it is the phone column with the bottom tab bar. From 1024px up the sidebar
// takes the left edge and the page sits beside it in a centred column, or across the whole area when its
// path is in FULL_WIDTH_PATHS.
const COLUMN = 'lg:max-w-6xl lg:mx-auto lg:px-8'

export default function Layout() {
  const { user } = useAuthStore()
  const full = isFullWidthPath(useLocation().pathname)
  return (
    <div className="min-h-screen bg-brand-offwhite flex flex-col max-w-md mx-auto border-x border-brand-night/10 relative lg:max-w-none lg:mx-0 lg:border-x-0 lg:pl-60">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      {user && <SideNav />}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        {isLocal() && <div className={COLUMN}><PhoneBanners /></div>}
        <div data-testid="shell-content" data-width={full ? 'full' : 'column'} className={full ? undefined : `${COLUMN} lg:py-6`}><Outlet /></div>
      </main>
      {user && <BottomNav />}
    </div>
  )
}
