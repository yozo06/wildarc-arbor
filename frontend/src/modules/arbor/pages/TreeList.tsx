import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTrees, type Tree } from '../api/trees'
import { getZones } from '../api/species'
import { useAuthStore } from '../../../core/store/auth.store'
import TreeCard from '../components/TreeCard'
import Spinner, { EmptyState } from '../../../core/components/Spinner'
import { Search, Plus, Filter } from 'lucide-react'

const ACTIONS = ['all', 'cut', 'trim', 'keep', 'monitor', 'treat', 'pending']
const STATUSES = ['all', 'pending', 'in_progress', 'completed', 'on_hold']

export default function TreeList() {
  const { isOwner } = useAuthStore()
  const nav = useNavigate()
  const [trees, setTrees] = useState<Tree[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('all')
  const [status, setStatus] = useState('all')
  const [zone, setZone] = useState('all')
  const [zones, setZones] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { getZones().then(setZones) }, [])

  const load = useCallback(() => {
    setLoading(true)
    const params: any = { limit: 100 }
    if (search) params.search = search
    if (action !== 'all') params.action = action
    if (status !== 'all') params.status = status
    if (zone !== 'all') params.zone = zone
    getTrees(params).then((r: any) => { setTrees(r.trees); setTotal(r.total || 0) }).finally(() => setLoading(false))
  }, [search, action, status, zone])

  useEffect(() => { load() }, [load])

  const activeFilterCount = [action !== 'all', status !== 'all', zone !== 'all'].filter(Boolean).length

  return (
    <div className="px-4 pt-12 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Trees</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(f => !f)} aria-label="Toggle filters"
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 ${showFilters ? 'bg-forest-600 border-forest-600 text-white' : 'border-gray-200 text-gray-500'}`}>
            <Filter size={16} />
            {activeFilterCount > 0 && !showFilters && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          {isOwner() && <button onClick={() => nav('/trees/new')} aria-label="Add new tree" className="w-11 h-11 bg-forest-600 rounded-xl flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2"><Plus size={18} /></button>}
        </div>
      </div>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" placeholder="Search by tree code…" />
      </div>
      {showFilters && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-3 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Zone</p>
            <select value={zone} onChange={e => setZone(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300">
              <option value="all">All Zones</option>
              {zones.map((z: any) => <option key={z.id} value={z.id}>{z.zone_name} ({z.zone_code})</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Action</p>
            <div className="flex flex-wrap gap-1.5">
              {ACTIONS.map(a => <button key={a} onClick={() => setAction(a)} className={`text-xs px-3 py-1 rounded-full border capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 ${action === a ? 'bg-forest-600 text-white border-forest-600' : 'border-gray-200 text-gray-500'}`}>{a}</button>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map(s => <button key={s} onClick={() => setStatus(s)} className={`text-xs px-3 py-1 rounded-full border capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 ${status === s ? 'bg-forest-600 text-white border-forest-600' : 'border-gray-200 text-gray-500'}`}>{s.replace('_', ' ')}</button>)}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={() => { setAction('all'); setStatus('all'); setZone('all') }}
              className="text-xs text-red-500 font-medium rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2">Clear all filters</button>
          )}
        </div>
      )}
      <p className="text-xs text-gray-400 mb-3">{total} trees</p>
      {loading ? <Spinner /> : trees.length === 0
        ? <EmptyState icon="🌳" title="No trees found" sub="Try adjusting your filters" />
        : <div className="space-y-2">{trees.map(t => <TreeCard key={t.id} tree={t} />)}</div>
      }
    </div>
  )
}

