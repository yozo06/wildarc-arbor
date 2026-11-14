import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const apply = vi.fn(async () => {})
vi.mock('../../core/data/local/farmFile', () => ({
  exportFarm: vi.fn(async () => ({ blob: new Blob(['x']), bytes: new Uint8Array(), filename: 'arbor-farm-2026-11-13.zip' })),
  readFarmFile: vi.fn(async () => ({ summary: { trees: 212, photos: 48, savedAt: '2026-11-03T10:00:00.000Z' }, apply })),
}))
vi.mock('../../core/data/local/store', () => ({ readMeta: vi.fn(async () => undefined) }))
vi.mock('../../core/phone/install', () => ({ canPromptInstall: vi.fn(() => false), promptInstall: vi.fn(), onInstallAvailable: vi.fn(() => () => {}) }))
vi.mock('../../core/phone/download', () => ({ downloadBlob: vi.fn() }))

import { exportFarm } from '../../core/data/local/farmFile'
import { downloadBlob } from '../../core/phone/download'
import FarmFileCard from './FarmFileCard'

describe('FarmFileCard', () => {
  it('says the farm has not been saved yet', async () => {
    render(<FarmFileCard />)
    expect(await screen.findByText('Not saved yet')).toBeInTheDocument()
  })

  it('saves the farm as a download', async () => {
    render(<FarmFileCard />)
    fireEvent.click(screen.getByRole('button', { name: 'Save my farm' }))
    await waitFor(() => expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'arbor-farm-2026-11-13.zip'))
    expect(exportFarm).toHaveBeenCalled()
  })

  it('opening a file shows what it holds and replaces the farm only after confirming', async () => {
    render(<FarmFileCard />)
    const file = new File(['zip'], 'arbor-farm-2026-11-03.zip', { type: 'application/zip' })
    fireEvent.change(screen.getByLabelText('Open a farm file'), { target: { files: [file] } })
    expect(await screen.findByText(/212 trees, 48 photos, saved/)).toBeInTheDocument()
    expect(screen.getByText(/This replaces the farm on this device/)).toBeInTheDocument()
    expect(apply).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Replace my farm' }))
    await waitFor(() => expect(apply).toHaveBeenCalled())
  })
})
