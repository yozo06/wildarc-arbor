import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('../api/trees', () => ({
  getTree: vi.fn(async () => ({
    tree_code: 'T-1', health_score: 7, status: 'pending', action: 'keep', priority: 'medium',
    species: { common_name: 'Mango', scientific_name: 'Mangifera indica' },
  })),
  getPhotos: vi.fn(async () => [{ id: 1, photo_url: 'blob:photo-1', taken_at: '2026-11-01T08:00:00Z' }]),
  getActivity: vi.fn(async () => [{ id: 1, action_taken: 'watered', logged_at: '2026-11-02T08:00:00Z', notes: null }]),
  updateTree: vi.fn(), uploadPhoto: vi.fn(),
}))

import TreeDetail from './TreeDetail'

const renderAt = () => render(
  <MemoryRouter initialEntries={['/trees/T-1']}>
    <Routes><Route path="/trees/:code" element={<TreeDetail />} /></Routes>
  </MemoryRouter>,
)

describe('TreeDetail', () => {
  it('shows the photo from photo_url', async () => {
    renderAt()
    const imgs = await screen.findAllByRole('img')
    expect(imgs.some(i => i.getAttribute('src') === 'blob:photo-1')).toBe(true)
  })

  it('shows health as a score out of 10', async () => {
    renderAt()
    expect(await screen.findByText('/10')).toBeInTheDocument()
    expect(screen.queryByText('%')).not.toBeInTheDocument()
  })

  it('dates the work log from logged_at', async () => {
    renderAt()
    expect(await screen.findByText(new Date('2026-11-02T08:00:00Z').toLocaleDateString())).toBeInTheDocument()
    expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument()
  })
})
