import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../api/dashboard', () => ({ getDashboardStats: vi.fn() }))
vi.mock('../api/trees', () => ({ getTrees: vi.fn() }))

import { getDashboardStats } from '../api/dashboard'
import { getTrees } from '../api/trees'
import { useAuthStore } from '../../../core/store/auth.store'
import Dashboard from './Dashboard'

describe('Dashboard', () => {
  it('reads the module API and the current auth store', async () => {
    vi.mocked(getDashboardStats).mockResolvedValue({
      stats: { total: 4, pending: 1, inProgress: 0, completed: 3, toCut: 0, toTrim: 0, urgent: 0 }, zones: [],
    })
    vi.mocked(getTrees).mockResolvedValue({ trees: [], total: 0, page: 1 })
    useAuthStore.setState({ user: { id: 1, name: 'Asha Rao', email: '', role: 'owner' }, token: 'x' })

    render(<MemoryRouter><Dashboard /></MemoryRouter>)

    await waitFor(() => expect(getDashboardStats).toHaveBeenCalled())
    expect(getTrees).toHaveBeenCalledWith({ priority: 'urgent', limit: 3 })
    expect(await screen.findByText(/Asha/)).toBeInTheDocument()
  })
})
