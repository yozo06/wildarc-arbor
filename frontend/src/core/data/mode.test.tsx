import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryStore, resetStoreForTests } from './local/store'
import { createTree } from './local/farm'
import { loadSampleFarm } from './local/sample'
import { DATA_MODE } from './mode'
import { useAuthStore } from '../store/auth.store'
import App from '../../App'

describe('local mode', () => {
  beforeEach(() => resetStoreForTests(createMemoryStore()))

  it('is the default when VITE_DATA_MODE is not "server"', () => {
    expect(DATA_MODE).toBe('local')
  })

  it('starts the auth store as the phone owner', () => {
    expect(useAuthStore.getState().user).toMatchObject({ id: 1, role: 'owner' })
    expect(useAuthStore.getState().token).toBe('local')
  })

  it('opens Home without signing in', async () => {
    await createTree({ tree_code: 'T-1' })
    window.history.pushState({}, '', '/login')
    render(<App />)
    expect(await screen.findByText('1 pending')).toBeInTheDocument()
    await waitFor(() => expect(window.location.pathname).toBe('/home'))
  })

  it('shows the empty farm on Home right after the sample is cleared there', async () => {
    await loadSampleFarm()
    window.history.pushState({}, '', '/home')
    render(<App />)
    expect(await screen.findByText('22 pending')).toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: 'Clear sample' }))
    expect(await screen.findByText('0 pending')).toBeInTheDocument()
  })

  it('sends a phone with no farm yet to the welcome screen', async () => {
    window.history.pushState({}, '', '/home')
    render(<App />)
    expect(await screen.findByRole('button', { name: 'Start my farm' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/welcome')
  })
})
