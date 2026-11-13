import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Minus, Maximize2 } from 'lucide-react'
import {
  buildLegend, convexHull, fitView, getBounds, gridStep, keyFor, niceScale,
  parseBoundary, plotTrees, typicalSpacing, NEUTRAL_COLOR,
  type ColorMode, type MapTree, type MapZone, type PlottedTree, type Point, type View,
} from './landMap.utils'

const INK = '#1C2B1F'
const PAPER = '#F7F5EE'
const FALLBACK = { w: 360, h: 520 }

interface Props {
  trees: MapTree[]
  zones?: MapZone[]
  mode: ColorMode
  selectedId?: number
  onSelect?: (tree: MapTree | null) => void
}

/** Tree canopies. Re-renders on zoom / colour / selection, never on pan. */
const TreeLayer = memo(function TreeLayer({ pts, k, mode, colors, selectedId, showLabels, onPick }: {
  pts: PlottedTree[]; k: number; mode: ColorMode; colors: Map<string, string>
  selectedId?: number; showLabels: boolean; onPick: (t: PlottedTree) => void
}) {
  const minR = 5 / k
  return (
    <g>
      {pts.map(t => {
        const r = Math.max(t.r, minR)
        const selected = t.id === selectedId
        return (
          <g key={t.id}>
            {selected && <circle cx={t.x} cy={t.y} r={r + 4 / k} fill="none" stroke="#D8A419" strokeWidth={4} vectorEffect="non-scaling-stroke" />}
            <circle
              cx={t.x} cy={t.y} r={r}
              fill={colors.get(keyFor(t, mode)) || NEUTRAL_COLOR}
              stroke={INK} strokeOpacity={selected ? 1 : 0.6} strokeWidth={selected ? 2 : 1}
              vectorEffect="non-scaling-stroke"
              role="button" tabIndex={0} className="cursor-pointer"
              aria-label={`${t.tree_code}${t.display_name ? `, ${t.display_name}` : ''}, action ${t.action}`}
              onClick={e => { e.stopPropagation(); onPick(t) }}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(t) } }}
            />
            <circle cx={t.x} cy={t.y} r={r * 0.16} fill={INK} fillOpacity={0.6} pointerEvents="none" />
            {(showLabels || selected) && (
              <text
                x={t.x} y={t.y + r + 13 / k} fontSize={11 / k} fontWeight={700} textAnchor="middle"
                fill={INK} stroke={PAPER} strokeWidth={3 / k} paintOrder="stroke" pointerEvents="none"
              >{t.tree_code}</text>
            )}
          </g>
        )
      })}
    </g>
  )
})

/**
 * Top-view land map: trees placed by their coord_x / coord_y (metres),
 * with wheel / pinch zoom, drag to pan and tap to select.
 */
export default function LandMap({ trees, zones = [], mode, selectedId, onSelect }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const pts = useMemo(() => plotTrees(trees), [trees])
  const bounds = useMemo(() => getBounds(pts), [pts])
  const spacing = useMemo(() => typicalSpacing(pts), [pts])
  const colors = useMemo(() => new Map(buildLegend(pts, mode).map(l => [l.key, l.color])), [pts, mode])

  const [size, setSize] = useState(FALLBACK)
  const [view, setView] = useState<View>(() => fitView(bounds, FALLBACK.w, FALLBACK.h))
  const [animate, setAnimate] = useState(false)
  const userMoved = useRef(false)
  const gesture = useRef({ ptrs: new Map<number, { x: number; y: number }>(), dragged: false, down: { x: 0, y: 0 } })
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  // Track the container size.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const measure = () => { if (el.clientWidth > 0 && el.clientHeight > 0) setSize({ w: el.clientWidth, h: el.clientHeight }) }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Keep the whole farm in view until the user starts navigating.
  useEffect(() => {
    if (!userMoved.current) setView(fitView(bounds, size.w, size.h))
  }, [bounds, size.w, size.h])

  const fitK = useMemo(() => fitView(bounds, size.w, size.h).k, [bounds, size.w, size.h])
  const limits = useRef({ min: 0.01, max: 80 })
  limits.current = { min: fitK * 0.5, max: Math.max(fitK * 40, 60) }

  const zoomAt = useCallback((cx: number, cy: number, factor: number, smooth: boolean) => {
    userMoved.current = true
    setAnimate(smooth)
    setView(v => {
      const k = Math.min(limits.current.max, Math.max(limits.current.min, v.k * factor))
      const ratio = k / v.k
      return { k, tx: cx - (cx - v.tx) * ratio, ty: cy - (cy - v.ty) * ratio }
    })
  }, [])

  const local = (e: { clientX: number; clientY: number }) => {
    const rect = wrap.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  // Wheel zoom needs a non-passive listener so the page does not scroll with it.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * 0.0016), false)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const onPointerDown = (e: React.PointerEvent) => {
    const g = gesture.current, p = local(e)
    if (g.ptrs.size === 0) { g.dragged = false; g.down = p }
    g.ptrs.set(e.pointerId, p)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current, prev = g.ptrs.get(e.pointerId)
    if (!prev) return
    const p = local(e)
    if (g.ptrs.size === 1) {
      if (!g.dragged && Math.hypot(p.x - g.down.x, p.y - g.down.y) > 4) g.dragged = true
      if (g.dragged) {
        userMoved.current = true
        setAnimate(false)
        setView(v => ({ k: v.k, tx: v.tx + p.x - prev.x, ty: v.ty + p.y - prev.y }))
      }
    } else if (g.ptrs.size === 2) {
      const other = [...g.ptrs.entries()].find(([id]) => id !== e.pointerId)![1]
      const before = Math.hypot(prev.x - other.x, prev.y - other.y) || 1
      const after = Math.hypot(p.x - other.x, p.y - other.y) || 1
      g.dragged = true
      zoomAt((p.x + other.x) / 2, (p.y + other.y) / 2, after / before, false)
    }
    g.ptrs.set(e.pointerId, p)
  }
  const onPointerEnd = (e: React.PointerEvent) => { gesture.current.ptrs.delete(e.pointerId) }

  const pick = useCallback((t: PlottedTree) => {
    if (!gesture.current.dragged) onSelectRef.current?.(t)
  }, [])

  const fitAll = () => {
    userMoved.current = false
    setAnimate(true)
    setView(fitView(bounds, size.w, size.h))
  }

  // Zone shapes: a drawn boundary when one is stored, otherwise the hull of the zone's trees.
  const zoneShapes = useMemo(() => {
    const byZone = new Map<string, Point[]>()
    for (const t of pts) {
      if (!t.zone_code) continue
      if (!byZone.has(t.zone_code)) byZone.set(t.zone_code, [])
      byZone.get(t.zone_code)!.push([t.x, t.y])
    }
    const meta = new Map(zones.map(z => [z.zone_code, z]))
    const codes = new Set([...byZone.keys(), ...meta.keys()])
    const shapes: { code: string; name: string; poly: Point[]; drawn: boolean; labelX: number; labelY: number }[] = []
    for (const code of codes) {
      const drawn = parseBoundary(meta.get(code)?.boundary_coords)
      const poly = drawn ?? convexHull(byZone.get(code) || [])
      if (poly.length < 3) continue
      const xs = poly.map(p => p[0]), ys = poly.map(p => p[1])
      shapes.push({
        code, name: meta.get(code)?.zone_name || '', poly, drawn: !!drawn,
        labelX: (Math.min(...xs) + Math.max(...xs)) / 2, labelY: Math.min(...ys),
      })
    }
    return shapes.sort((a, b) => a.code.localeCompare(b.code))
  }, [pts, zones])

  const { k, tx, ty } = view
  const step = gridStep(k)
  const grid = useMemo(() => {
    const x0 = Math.floor(-tx / k / step) * step, x1 = (size.w - tx) / k
    const y0 = Math.floor(-ty / k / step) * step, y1 = (size.h - ty) / k
    const xs: number[] = [], ys: number[] = []
    for (let x = x0; x <= x1 && xs.length < 200; x += step) xs.push(x)
    for (let y = y0; y <= y1 && ys.length < 200; y += step) ys.push(y)
    return { xs, ys, x0, x1, y0, y1 }
  }, [k, tx, ty, step, size.w, size.h])

  const scale = niceScale(k)
  const showLabels = pts.length <= 12 || spacing * k >= 44

  if (!pts.length) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-brand-offwhite px-8 text-center">
        <p className="text-sm text-brand-muted">
          No trees are plotted yet. Add X / Y coordinates to a tree and it will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-brand-offwhite">
      <div
        ref={wrap}
        className="absolute inset-0 touch-none select-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd} onPointerLeave={onPointerEnd}
        onClick={() => { if (!gesture.current.dragged) onSelectRef.current?.(null) }}
      >
        <svg width="100%" height="100%" role="group" aria-label="Map of tree locations on farm land">
          <g style={{
            transform: `translate(${tx}px, ${ty}px) scale(${k})`, transformOrigin: '0 0',
            transition: animate ? 'transform 350ms cubic-bezier(0.2, 0.7, 0.2, 1)' : undefined,
          }}>
            <g stroke="#E3E0D3" strokeWidth={1} pointerEvents="none">
              {grid.xs.map(x => <line key={`x${x}`} x1={x} x2={x} y1={grid.y0} y2={grid.y1} vectorEffect="non-scaling-stroke" />)}
              {grid.ys.map(y => <line key={`y${y}`} y1={y} y2={y} x1={grid.x0} x2={grid.x1} vectorEffect="non-scaling-stroke" />)}
            </g>

            <g pointerEvents="none">
              {zoneShapes.map(z => (
                <polygon
                  key={z.code} points={z.poly.map(p => p.join(',')).join(' ')}
                  fill="#EAF3DE" stroke="#EAF3DE" strokeLinejoin="round"
                  strokeWidth={z.drawn ? 0 : 8} fillOpacity={0.85} strokeOpacity={0.85}
                />
              ))}
              {zoneShapes.filter(z => z.drawn).map(z => (
                <polygon
                  key={`b${z.code}`} points={z.poly.map(p => p.join(',')).join(' ')}
                  fill="none" stroke="#2A5934" strokeWidth={1.5} strokeDasharray="6 5" vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>

            <TreeLayer pts={pts} k={k} mode={mode} colors={colors} selectedId={selectedId} showLabels={showLabels} onPick={pick} />

            <g pointerEvents="none">
              {zoneShapes.map(z => (
                <text
                  key={z.code} x={z.labelX} y={z.labelY - (z.drawn ? 6 : 10) / k - (z.drawn ? 0 : 4)}
                  fontSize={11 / k} fontWeight={800} textAnchor="middle" letterSpacing={0.8 / k}
                  fill={INK} stroke={PAPER} strokeWidth={3 / k} paintOrder="stroke"
                >{`ZONE ${z.code}${z.name ? ` · ${z.name.toUpperCase()}` : ''}`}</text>
              ))}
            </g>
          </g>
        </svg>
      </div>

      <div className="absolute left-3 top-3 px-3 py-2 bg-white/95 border border-brand-night/10 rounded-xl pointer-events-none">
        <p className="text-xs font-bold text-brand-night leading-none mb-1">{scale.metres} m</p>
        <div className="h-1.5 border-2 border-t-0 border-brand-night" style={{ width: scale.px }} />
      </div>

      <div className="absolute right-3 top-3 flex flex-col bg-white/95 border border-brand-night/10 rounded-xl overflow-hidden">
        <button type="button" aria-label="Zoom in" onClick={() => zoomAt(size.w / 2, size.h / 2, 1.6, true)}
          className="w-11 h-11 flex items-center justify-center text-brand-night"><Plus size={18} /></button>
        <button type="button" aria-label="Zoom out" onClick={() => zoomAt(size.w / 2, size.h / 2, 1 / 1.6, true)}
          className="w-11 h-11 flex items-center justify-center text-brand-night border-t border-brand-night/10"><Minus size={18} /></button>
        <button type="button" aria-label="Fit whole farm" onClick={fitAll}
          className="w-11 h-11 flex items-center justify-center text-brand-night border-t border-brand-night/10"><Maximize2 size={16} /></button>
      </div>
    </div>
  )
}
