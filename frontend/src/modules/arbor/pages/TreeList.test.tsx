import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Tree } from '../api/trees'

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock API calls
const mockGetTrees = vi.fn()
const mockGetZones = vi.fn()
vi.mock('../api/trees', () => ({
  getTrees: (...args: any[]) => mockGetTrees(...args),
}))
vi.mock('../api/species', () => ({
  getZones: (...args: any[]) => mockGetZones(...args),
}))

// Mock auth store
const mockIsOwner = vi.fn(() => true)
vi.mock('../../../core/store/auth.store', () => ({
  useAuthStore: () => ({ isOwner: mockIsOwner }),
}))

// Mock child components
vi.mock('../components/TreeCard', () => ({
  default: ({ tree }: { tree: Tree }) => <div data-testid={`tree-card-${tree.id}`}>{tree.tree_code}</div>,
}))
vi.mock('../../../core/components/Spinner', () => ({
  default: ({ label }: { label?: string }) => <div data-testid="spinner">{label}</div>,
  EmptyState: ({ title, sub }: { icon: string; title: string; sub?: string }) => (
    <div data-testid="empty-state">{title}{sub && ` — ${sub}`}</div>
  ),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Search: () => <span data-testid="icon-search" />,
  Plus: () => <span data-testid="icon-plus">+</span>,
  Filter: () => <span data-testid="icon-filter" />,
}))

import TreeList from './TreeList'

const mockTrees: Tree[] = [
  { id: 1, tree_code: 'T-001', action: 'keep', status: 'completed', priority: 'low', updated_at: '2026-04-01T00:00:00Z', custom_common_name: 'Mango' },
  { id: 2, tree_code: 'T-002', action: 'cut', status: 'pending', priority: 'urgent', updated_at: '2026-04-02T00:00:00Z', custom_common_name: 'Jackfruit' },
  { id: 3, tree_code: 'T-003', action: 'trim', status: 'in_progress', priority: 'high', updated_at: '2026-04-03T00:00:00Z', custom_common_name: 'Silver Oak' },
]

const mockZones = [
  { id: 1, zone_name: 'Coffee Block', zone_code: 'Z-A' },
  { id: 2, zone_name: 'Bamboo Grove', zone_code: 'Z-B' },
]

describe('TreeList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTrees.mockResolvedValue({ trees: mockTrees, total: 3 })
    mockGetZones.mockResolvedValue(mockZones)
    mockIsOwner.mockReturnValue(true)
  })

  it('shows spinner while loading', () => {
    mockGetTrees.mockReturnValue(new Promise(() => {}))
    render(<TreeList />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('renders page title "Trees"', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByText('Trees')).toBeInTheDocument()
    })
  })

  it('renders all tree cards after loading', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByTestId('tree-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('tree-card-2')).toBeInTheDocument()
      expect(screen.getByTestId('tree-card-3')).toBeInTheDocument()
    })
  })

  it('displays total count', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByText('3 trees')).toBeInTheDocument()
    })
  })

  it('shows empty state when no trees match', async () => {
    mockGetTrees.mockResolvedValue({ trees: [], total: 0 })
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText(/No trees found/)).toBeInTheDocument()
    })
  })

  it('renders search input', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by tree code…')).toBeInTheDocument()
    })
  })

  it('shows add-tree button for owners', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByLabelText('Add new tree')).toBeInTheDocument()
    })
  })

  it('hides add-tree button for non-owners', async () => {
    mockIsOwner.mockReturnValue(false)
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByText('Trees')).toBeInTheDocument()
    })
    expect(screen.queryByLabelText('Add new tree')).not.toBeInTheDocument()
  })

  it('shows filter toggle button', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByLabelText('Toggle filters')).toBeInTheDocument()
    })
  })

  it('toggles filter panel visibility on click', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByText('Trees')).toBeInTheDocument()
    })

    // Filters should be hidden initially
    expect(screen.queryByText('Zone')).not.toBeInTheDocument()

    // Click filter toggle
    fireEvent.click(screen.getByLabelText('Toggle filters'))

    // Now filter panel should be visible
    expect(screen.getByText('Zone')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders zone dropdown in filters with loaded zones', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByText('Trees')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Toggle filters'))

    await waitFor(() => {
      expect(screen.getByText('All Zones')).toBeInTheDocument()
      expect(screen.getByText('Coffee Block (Z-A)')).toBeInTheDocument()
      expect(screen.getByText('Bamboo Grove (Z-B)')).toBeInTheDocument()
    })
  })

  it('renders action filter buttons', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByText('Trees')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Toggle filters'))

    // ACTIONS = ['all', 'cut', 'trim', 'keep', 'monitor', 'treat', 'pending']
    expect(screen.getByRole('button', { name: 'cut' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'trim' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'keep' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'monitor' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'treat' })).toBeInTheDocument()
  })

  it('renders status filter buttons', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByText('Trees')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Toggle filters'))

    // STATUSES = ['all', 'pending', 'in_progress', 'completed', 'on_hold']
    // Note: 'pending' appears in both ACTIONS and STATUSES filter rows,
    // so we use getAllByRole to handle the duplicate and assert at least one exists.
    expect(screen.getAllByRole('button', { name: 'pending' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: 'in progress' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'completed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'on hold' })).toBeInTheDocument()
  })

  it('calls getTrees with action filter when filter is selected', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByText('Trees')).toBeInTheDocument()
    })

    // Open filters
    fireEvent.click(screen.getByLabelText('Toggle filters'))

    // Clear previous call tracking
    mockGetTrees.mockClear()

    // Click "cut" action filter
    fireEvent.click(screen.getByRole('button', { name: 'cut' }))

    await waitFor(() => {
      expect(mockGetTrees).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'cut', limit: 100 })
      )
    })
  })

  it('calls getTrees with status filter when filter is selected', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByText('Trees')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Toggle filters'))
    mockGetTrees.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'completed' }))

    await waitFor(() => {
      expect(mockGetTrees).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'completed', limit: 100 })
      )
    })
  })

  it('shows clear filters button when filters are active and clears them', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(screen.getByText('Trees')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Toggle filters'))
    fireEvent.click(screen.getByRole('button', { name: 'cut' }))

    await waitFor(() => {
      expect(screen.getByText('Clear all filters')).toBeInTheDocument()
    })

    mockGetTrees.mockClear()
    fireEvent.click(screen.getByText('Clear all filters'))

    await waitFor(() => {
      // After clearing, getTrees should be called with only { limit: 100 }
      expect(mockGetTrees).toHaveBeenCalledWith({ limit: 100 })
    })
  })

  it('loads zones on mount', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(mockGetZones).toHaveBeenCalledTimes(1)
    })
  })

  it('calls getTrees on initial mount with default params', async () => {
    render(<TreeList />)
    await waitFor(() => {
      expect(mockGetTrees).toHaveBeenCalledWith({ limit: 100 })
    })
  })
})
