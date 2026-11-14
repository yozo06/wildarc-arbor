import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('../phone/install', () => ({
  isIos: vi.fn(() => false), isInstalled: vi.fn(() => false),
  canPromptInstall: vi.fn(() => false), promptInstall: vi.fn(), onInstallAvailable: vi.fn(() => () => {}),
}))
vi.mock('../data/local/sample', () => ({
  loadSampleFarm: vi.fn(async () => {}), clearFarm: vi.fn(async () => {}), isSampleLoaded: vi.fn(async () => false),
}))
vi.mock('../data/local/store', () => ({ writeMeta: vi.fn(async () => {}) }))
vi.mock('../phone/useFarmStatus', () => ({ useFarmStatus: vi.fn(() => null) }))

import { isIos } from '../phone/install'
import { clearFarm, isSampleLoaded, loadSampleFarm } from '../data/local/sample'
import { writeMeta } from '../data/local/store'
import { useFarmStatus } from '../phone/useFarmStatus'
import Welcome from './Welcome'

const renderWelcome = () => render(
  <MemoryRouter initialEntries={['/welcome']}>
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/home" element={<p>Home page</p>} />
    </Routes>
  </MemoryRouter>,
)

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(isIos).mockReturnValue(false)
  vi.mocked(isSampleLoaded).mockResolvedValue(false)
  vi.mocked(useFarmStatus).mockReturnValue(null)
})

describe('Welcome', () => {
  it('on Android offers the two ways in, with no Home Screen card', () => {
    renderWelcome()
    expect(screen.getByRole('button', { name: 'Start my farm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Look around the sample farm' })).toBeInTheDocument()
    expect(screen.queryByText(/Add Arbor to your Home Screen first/)).not.toBeInTheDocument()
    expect(screen.getByText(/Your farm stays on this device: no account, no server\./)).toBeInTheDocument()
  })

  it('on iPhone leads with the Home Screen card before anything else', async () => {
    vi.mocked(isIos).mockReturnValue(true)
    renderWelcome()
    expect(screen.getByText(/Add Arbor to your Home Screen first/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start my farm' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continue in Safari anyway' }))
    expect(screen.getByRole('button', { name: 'Start my farm' })).toBeInTheDocument()
  })

  it('loads the sample and goes home', async () => {
    renderWelcome()
    fireEvent.click(screen.getByRole('button', { name: 'Look around the sample farm' }))
    expect(loadSampleFarm).toHaveBeenCalled()
    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })

  it('starting a farm while the sample is loaded clears the sample first', async () => {
    vi.mocked(isSampleLoaded).mockResolvedValue(true)
    renderWelcome()
    fireEvent.click(screen.getByRole('button', { name: 'Start my farm' }))
    await waitFor(() => expect(clearFarm).toHaveBeenCalled())
    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })

  it('starting a fresh farm records when it started', async () => {
    renderWelcome()
    fireEvent.click(screen.getByRole('button', { name: 'Start my farm' }))
    await waitFor(() => expect(writeMeta).toHaveBeenCalledWith('startedAt', expect.any(String)))
  })

  it('sends a phone that already has a real farm home, so the sample can never replace it', async () => {
    vi.mocked(useFarmStatus).mockReturnValue({ started: true, sample: false, treeCount: 12, storage: 'indexeddb', version: 1 })
    renderWelcome()
    expect(await screen.findByText('Home page')).toBeInTheDocument()
    expect(loadSampleFarm).not.toHaveBeenCalled()
  })
})
