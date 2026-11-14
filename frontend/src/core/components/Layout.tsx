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
// path is in FULL_WIDTH_PATHS. A full-width page gets exactly the height left between any banner and the
// bottom tabs (the window edge at lg), at every width, so it can size itself with h-full and the window
// never scrolls. Its banners run the width of the page area instead of sitting in the centred column.
const COLUMN = 'lg:max-w-6xl lg:mx-auto lg:px-8'
// What a full-width page keeps clear for the fixed bottom tabs below lg: the bar's own 57px (icon, label,
// padding, top border) plus the safe-area inset it pads itself with. Ordinary pages keep the roomier pb-20.
const TABS_RESERVE = 'pb-[calc(57px+env(safe-area-inset-bottom,0px))]'

export default function Layout() {
  const { user } = useAuthStore()
  const full = isFullWidthPath(useLocation().pathname)
  return (
    <div className={`${full ? 'h-[100dvh]' : 'min-h-screen'} bg-brand-offwhite flex flex-col max-w-md mx-auto border-x border-brand-night/10 relative lg:max-w-none lg:mx-0 lg:border-x-0 lg:pl-60`}>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      {user && <SideNav />}
      <main className={`flex-1 overflow-y-auto lg:pb-0 ${full ? `min-h-0 flex flex-col ${TABS_RESERVE}` : 'pb-20'}`}>
        {isLocal() && <div className={full ? 'shrink-0 lg:px-6 lg:bg-white lg:[&>*]:mb-4' : `${COLUMN} lg:w-full`}><PhoneBanners /></div>}
        <div data-testid="shell-content" data-width={full ? 'full' : 'column'} className={full ? 'flex-1 min-h-0' : `${COLUMN} lg:py-6`}><Outlet /></div>
      </main>
      {user && <BottomNav />}
    </div>
  )
}
