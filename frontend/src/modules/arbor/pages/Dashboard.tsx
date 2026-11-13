import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats } from '../api/dashboard'
import { getTrees } from '../api/trees'
import { useAuthStore } from '../../../core/store/auth.store'
import { Plus, AlertTriangle, ChevronRight } from 'lucide-react'
import Spinner from '../../../core/components/Spinner'

const F   = '#2A5934'
const FL  = '#EAF3DE'
const FM  = '#639922'
const OFF = '#F7F5EE'
const NGT = '#1C2B1F'
const MUT = '#6B7B6F'
const AMB = '#D8A419'
const RED = '#E24B4A'

const STAT_CARDS = (stats: any) => [
  { label: 'Total',   val: stats.total,     bg: FL,        fg: F   },
  { label: 'Done',    val: stats.completed, bg: FL,        fg: FM  },
  { label: 'To Cut',  val: stats.toCut,     bg: '#FCEBEB', fg: RED },
  { label: 'To Trim', val: stats.toTrim,    bg: '#FEF7E6', fg: AMB },
]

export default function Dashboard() {
  const { user, isOwner } = useAuthStore()
  const nav = useNavigate()
  const [data, setData]     = useState<any>(null)
  const [urgent, setUrgent] = useState<any[]>([])

  useEffect(() => {
    Promise.all([getDashboardStats(), getTrees({ priority: 'urgent', limit: 3 })])
      .then(([s, u]) => { setData(s); setUrgent(u.trees) })
  }, [])

  if (!data) return <Spinner label="Loading dashboard…" />
  const { stats, zones } = data
  const pct = Math.round((stats.completed / (stats.total || 1)) * 100)

  return (
    <div style={{ padding: '52px 16px 16px', background: OFF, minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, color: MUT, marginBottom: 2 }}>Good morning</p>
          <h1 style={{ fontSize: 24, fontWeight: 500, color: NGT, lineHeight: 1.2 }}>
            {user?.name.split(' ')[0]} 👋
          </h1>
        </div>
        {isOwner() && (
          <button
            onClick={() => nav('/trees/new')}
            aria-label="Add new tree"
            style={{ width: 44, height: 44, background: F, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={18} color={OFF} />
          </button>
        )}
      </div>

      {/* Stat cards 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {STAT_CARDS(stats).map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '16px 16px 14px' }}>
            <p style={{ fontSize: 30, fontWeight: 500, color: s.fg, lineHeight: 1 }}>{s.val}</p>
            <p style={{ fontSize: 11, color: s.fg, opacity: 0.75, marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, border: '1px solid rgba(42,89,52,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: NGT }}>Overall Progress</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: FM }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: FL, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: F, borderRadius: 8, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: MUT }}>{stats.pending} pending</span>
          <span style={{ fontSize: 11, color: AMB }}>{stats.inProgress} in progress</span>
          <span style={{ fontSize: 11, color: FM }}>{stats.completed} done</span>
        </div>
      </div>

      {/* Urgent items */}
      {urgent.length > 0 && (
        <div style={{ background: '#FCEBEB', border: '1px solid rgba(226,75,74,0.15)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: RED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={11} /> Urgent attention
          </p>
          {urgent.map((t: any) => (
            <div key={t.id} onClick={() => nav(`/trees/${t.tree_code}`)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(226,75,74,0.12)', cursor: 'pointer' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: NGT }}>{t.custom_common_name || t.species?.common_name}</p>
                <p style={{ fontSize: 10, fontFamily: 'monospace', color: MUT, marginTop: 1 }}>{t.tree_code}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, background: RED, color: '#fff', padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' }}>{t.action}</span>
                <ChevronRight size={14} color={MUT} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zones breakdown */}
      {zones.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid rgba(42,89,52,0.08)' }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: MUT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>By Zone</p>
          {zones.map((z: any, i: number) => {
            const zp = Math.round((z.completed / (z.total_trees || 1)) * 100)
            return (
              <div key={z.zone_code} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: i < zones.length - 1 ? '1px solid rgba(28,43,31,0.06)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: NGT }}>{z.zone_name}</p>
                    <p style={{ fontSize: 10, color: MUT }}>{z.zone_code} · {z.total_trees} trees</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: FM }}>{zp}%</span>
                </div>
                <div style={{ height: 4, background: FL, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${zp}%`, background: FM, borderRadius: 4 }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
