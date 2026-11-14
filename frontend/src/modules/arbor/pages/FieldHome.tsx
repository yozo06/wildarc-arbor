import { useEffect, useState } from 'react'
import { getTrees } from '../api/trees'
import { useAuthStore } from '../../../core/store/auth.store'
import TreeCard from '../components/TreeCard'
import Spinner, { EmptyState } from '../../../core/components/Spinner'

export default function FieldHome() {
  const { user } = useAuthStore()
  const [trees, setTrees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getTrees({ limit: 50 }).then((r: any) => setTrees(r.trees)).finally(() => setLoading(false))
  }, [])
  if (loading) return <Spinner label="Loading your tasks…" />
  const pending = trees.filter(t => t.status==='pending')
  const inProg  = trees.filter(t => t.status==='in_progress')
  return (
    <div className="px-4 pt-12 pb-4 lg:px-0 lg:pt-0 lg:pb-0">
      <div className="mb-6">
        <p className="text-xs text-gray-400 uppercase">Good morning</p>
        <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{trees.length} tasks assigned to you</p>
      </div>
      {inProg.length > 0 && (
        <div className="mb-4 lg:mb-6">
          <p className="text-xs font-semibold text-blue-600 uppercase mb-2">In Progress</p>
          <div className="space-y-2 lg:space-y-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-3">{inProg.map(t => <TreeCard key={t.id} tree={t} />)}</div>
        </div>
      )}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Pending</p>
          <div className="space-y-2 lg:space-y-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-3">{pending.map(t => <TreeCard key={t.id} tree={t} />)}</div>
        </div>
      )}
      {trees.length===0 && <EmptyState icon="✅" title="All caught up!" sub="No tasks assigned to you right now." />}
    </div>
  )
}
