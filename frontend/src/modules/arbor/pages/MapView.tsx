import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMapTrees, getMapZones } from '../api/map'
import LandMap from '../components/LandMap'
import { buildLegend, healthBand, plotTrees, type ColorMode, type MapTree, type MapZone } from '../components/landMap.utils'
import { ActionBadge } from '../components/ActionBadge'
import Spinner from '../../../core/components/Spinner'

const MODE_LABELS: Record<ColorMode, string> = { action: 'Action', health: 'Health', zone: 'Zone', species: 'Species' }

export default function MapView() {
  const nav = useNavigate()
  const [trees, setTrees] = useState<MapTree[]>([])
  const [zones, setZones] = useState<MapZone[]>([])
  const [selected, setSelected] = useState<MapTree | null>(null)
  const [mode, setMode] = useState<ColorMode>('action')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMapTrees().then(setTrees).finally(() => setLoading(false))
    // Zone names / boundaries are a nice-to-have; the map works without them.
    getMapZones().then(setZones).catch(() => {})
  }, [])

  const plotted = useMemo(() => plotTrees(trees), [trees])
  const legend = useMemo(() => buildLegend(plotted, mode), [plotted, mode])
  // Only offer a colour mode when the data can support it.
  const modes = useMemo(() => {
    const m: ColorMode[] = ['action']
    if (plotted.some(t => t.health_score != null)) m.push('health')
    if (plotted.some(t => t.zone_code)) m.push('zone')
    if (plotted.some(t => t.display_name)) m.push('species')
    return m
  }, [plotted])

  if (loading) return <Spinner label="Loading map…" />

  const unplotted = trees.length - plotted.length
  const band = selected ? healthBand(selected.health_score) : null

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[auto_minmax(0,1fr)] h-full lg:bg-white">
      <div className="px-4 pt-12 pb-3 bg-white border-b border-brand-night/10 lg:col-start-2 lg:row-start-1 lg:px-6 lg:pt-6 lg:pb-5">
        <h1 className="text-xl font-bold text-brand-night">Land Map</h1>
        <p className="text-xs text-brand-muted">
          {plotted.length} trees plotted{unplotted > 0 ? ` · ${unplotted} without coordinates` : ''}
        </p>
        {modes.length > 1 && (
          <div className="mt-3 flex rounded-xl border border-brand-night/15 overflow-hidden" role="group" aria-label="Colour trees by">
            {modes.map(m => (
              <button
                key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}
                className={`flex-1 h-11 text-sm font-semibold ${mode === m ? 'bg-brand-forest text-white' : 'bg-white text-brand-night'}`}
              >{MODE_LABELS[m]}</button>
            ))}
          </div>
        )}
      </div>

      {legend.length > 0 && (
        <div className="flex gap-3 px-4 py-2 bg-white border-b border-brand-night/10 overflow-x-auto lg:col-start-2 lg:row-start-2 lg:flex-col lg:gap-2.5 lg:px-6 lg:py-5 lg:border-b-0 lg:min-h-0 lg:overflow-x-hidden lg:overflow-y-auto">
          {legend.map(l => (
            <div key={l.key} className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border border-brand-night/40" style={{ background: l.color }} />
              <span className="text-xs text-brand-night lg:text-sm lg:min-w-0 lg:truncate">{l.label}</span>
              <span className="text-xs text-brand-muted lg:text-sm lg:ml-auto lg:pl-2">{l.count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 relative lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:border-r lg:border-brand-night/10">
        <LandMap trees={trees} zones={zones} mode={mode} selectedId={selected?.id} onSelect={setSelected} />
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 border border-brand-night/10 lg:bottom-6 lg:left-6 lg:right-auto lg:w-96">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-mono text-brand-muted">{selected.tree_code}</p>
                <p className="font-semibold text-brand-night truncate">{selected.display_name || 'Unknown'}</p>
                <p className="text-xs text-brand-muted">
                  {[
                    selected.zone_code ? `Zone ${selected.zone_code}` : null,
                    band ? `Health ${selected.health_score}/10` : null,
                    `X ${selected.coord_x} · Y ${selected.coord_y} m`,
                  ].filter(Boolean).join(' · ')}
                </p>
              </div>
              <ActionBadge action={selected.action} />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => nav(`/trees/${selected.tree_code}`)} className="flex-1 bg-brand-forest text-white text-sm font-medium py-2 rounded-xl">View Tree</button>
              <button onClick={() => setSelected(null)} aria-label="Dismiss selection" className="w-11 h-11 border border-brand-night/15 rounded-xl text-brand-muted flex items-center justify-center">✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
