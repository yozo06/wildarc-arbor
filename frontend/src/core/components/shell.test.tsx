import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { createMemoryStore, resetStoreForTests } from '../data/local/store'
import { useAuthStore } from '../store/auth.store'
import { navItemsFor, isFullWidthPath } from './nav'
import BottomNav from './BottomNav'
import SideNav from './SideNav'
import Layout from './Layout'

// jsdom does not evaluate media queries, so these tests look at structure and links, not at which nav shows.
const links = (nav: HTMLElement) =>
  within(nav).getAllByRole('link').map(a => [a.textContent, a.getAttribute('href')])

describe('nav destinations', () => {
  it('gives an owner in local mode Home, Trees, Map and Me, without Team', () => {
    expect(navItemsFor({ owner: true, local: true }).map(i => [i.label, i.to])).toEqual([
      ['Home', '/home'], ['Trees', '/trees'], ['Map', '/map'], ['Me', '/profile'],
    ])
  })

  it('adds Team for an owner in server mode', () => {
    expect(navItemsFor({ owner: true, local: false }).map(i => i.label)).toEqual(['Home', 'Trees', 'Map', 'Team', 'Me'])
  })

  it('leaves Map and Team out for people who are not owners', () => {
    expect(navItemsFor({ owner: false, local: false }).map(i => i.label)).toEqual(['Home', 'Trees', 'Me'])
  })
})

describe('sidebar', () => {
  const initial = useAuthStore.getState().user
  const signInAs = (role: string) => useAuthStore.setState({ user: { id: 1, name: 'You', email: '', role } })
  beforeEach(() => signInAs('owner'))
  afterEach(() => { cleanup(); useAuthStore.setState({ user: initial }) })

  it('shows the app name and the same destinations as the bottom nav, both from the shared list', () => {
    render(<MemoryRouter initialEntries={['/trees']}><SideNav /><BottomNav /></MemoryRouter>)
    const side = screen.getByRole('navigation', { name: 'Sidebar' })
    const bottom = screen.getByRole('navigation', { name: 'Tabs' })
    const shared = navItemsFor({ owner: true, local: true }).map(i => [i.label, i.to])

    expect(within(side).getByText('Arbor')).toBeInTheDocument()
    expect(links(side)).toEqual(shared)
    expect(links(bottom)).toEqual(shared)
    expect(within(side).queryByRole('link', { name: 'Team' })).not.toBeInTheDocument()
  })

  it('lists only Home, Trees and Me in both navs for someone who is not an owner', () => {
    signInAs('employee')
    render(<MemoryRouter initialEntries={['/trees']}><SideNav /><BottomNav /></MemoryRouter>)
    const expected = [['Home', '/home'], ['Trees', '/trees'], ['Me', '/profile']]

    expect(links(screen.getByRole('navigation', { name: 'Sidebar' }))).toEqual(expected)
    expect(links(screen.getByRole('navigation', { name: 'Tabs' }))).toEqual(expected)
    expect(screen.queryByRole('link', { name: 'Map' })).not.toBeInTheDocument()
  })

  it('marks the current destination', () => {
    render(<MemoryRouter initialEntries={['/trees']}><SideNav /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Trees' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })
})

describe('shell', () => {
  beforeEach(() => resetStoreForTests(createMemoryStore()))

  const shell = (path: string) => render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route element={<Layout />}><Route path="*" element={<p>page body</p>} /></Route></Routes>
    </MemoryRouter>
  )

  it('renders both navs around the page', () => {
    shell('/trees')
    expect(screen.getByRole('navigation', { name: 'Sidebar' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Tabs' })).toBeInTheDocument()
    expect(screen.getByText('page body')).toBeInTheDocument()
  })

  it('marks the content wrapper data-width="column" on ordinary paths and "full" on full-width paths', () => {
    expect(isFullWidthPath('/map')).toBe(true)
    expect(isFullWidthPath('/trees')).toBe(false)

    const usual = shell('/trees')
    expect(usual.getByTestId('shell-content')).toHaveAttribute('data-width', 'column')
    usual.unmount()
    expect(shell('/map').getByTestId('shell-content')).toHaveAttribute('data-width', 'full')
  })
})
