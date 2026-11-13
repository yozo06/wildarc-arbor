import { useNavigate } from 'react-router-dom'
import type { Tree } from '../api/trees'
import { ActionBadge, StatusDot } from './ActionBadge'

/** Returns a Tailwind-compatible hex for the health bar fill */
function healthColor(score: number): string {
  if (score >= 7) return '#639922'   // brand-forest-mid (healthy)
  if (score >= 4) return '#BA7517'   // amber (moderate)
  return '#E24B4A'                   // red (poor)
}

export default function TreeCard({ tree }: { tree: Tree }) {
  const nav = useNavigate()
  const name = tree.custom_common_name || (tree.species as any)?.common_name || 'Unknown'
  const score = tree.health_score
  return (
    <div className="bg-white rounded-[14px] p-4 border border-brand-night/8 active:scale-95 transition-transform cursor-pointer"
      onClick={() => nav(`/trees/${tree.tree_code}`)}>

      {/* ── Top row: code + action badge ── */}
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-1.5">
          <StatusDot status={tree.status} />
          <span className="text-[10px] font-mono text-brand-muted">{tree.tree_code}</span>
        </div>
        <ActionBadge action={tree.action} />
      </div>

      {/* ── Name + species ── */}
      <h3 className="text-[13px] font-medium text-brand-night leading-snug">{name}</h3>
      {(tree.species as any)?.scientific_name && (
        <p className="text-[10px] italic text-brand-muted mt-0.5">{(tree.species as any).scientific_name}</p>
      )}

      {/* ── Health score bar ── */}
      {score != null && (
        <div className="mt-2.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-brand-muted">Health</span>
            <span className="text-[10px] font-medium" style={{ color: healthColor(score) }}>{score}/10</span>
          </div>
          <div className="h-[3px] bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${score * 10}%`, background: healthColor(score) }} />
          </div>
        </div>
      )}

      {/* ── Footer: zone + assignee ── */}
      <div className="flex items-center justify-between mt-2">
        {(tree.land_zones as any) && (
          <span className="text-[10px] text-brand-muted">{(tree.land_zones as any).zone_name}</span>
        )}
        {(tree.assigned_user as any) && (
          <span className="text-[10px] text-brand-muted">→ {(tree.assigned_user as any).name}</span>
        )}
      </div>
    </div>
  )
}
