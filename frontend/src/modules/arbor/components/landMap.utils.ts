/**
 * Pure helpers for the Arbor Land Map (top view, pan + zoom).
 *
 * World units are metres, taken straight from trees.coord_x / coord_y.
 * Screen Y grows downward, so plotted Y is the negated coord_y.
 */
import { ACTION_COLORS } from '../../../core/constants/actionColors'

export interface MapTree {
  id: number
  tree_code: string
  display_name?: string | null
  coord_x?: number | string | null
  coord_y?: number | string | null
  action: string
  status?: string
  zone_code?: string | null
  health_score?: number | string | null
  height_m?: number | string | null
}

export interface MapZone {
  id?: number
  zone_code: string
  zone_name?: string | null
  boundary_coords?: unknown
}

export interface PlottedTree extends MapTree { x: number; y: number; r: number }
export interface View { k: number; tx: number; ty: number }
export interface Bounds { minX: number; minY: number; maxX: number; maxY: number }
export interface LegendItem { key: string; label: string; color: string; count: number }
export type ColorMode = 'action' | 'health' | 'zone' | 'species'
export type Point = [number, number]

export const NEUTRAL_COLOR = '#9ca3af'
export const HEALTH_BANDS = [
  { key: 'thriving', label: 'Thriving 9–10', min: 9, color: '#1E4D2B' },
  { key: 'good', label: 'Good 7–8', min: 7, color: '#86B36B' },
  { key: 'fair', label: 'Fair 4–6', min: 4, color: '#EBCB6B' },
  { key: 'poor', label: 'Poor 1–3', min: 1, color: '#B23A12' },
]
/** Categorical palette for zones / species, brand colours first. */
export const CATEGORY_COLORS = [
  '#2A5934', '#D8A419', '#4A7FA5', '#C2557A', '#8B5E3C',
  '#6E9C9A', '#7A5FA8', '#E07B39', '#A9BC3F', '#1C2B1F',
]

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Canopy radius in metres. Uses height when the API provides it. */
export function canopyRadius(heightM: unknown): number {
  const h = num(heightM)
  if (h === null || h <= 0) return 1.5
  return Math.min(6, Math.max(1, h * 0.22))
}

/** Trees that have usable coordinates, largest canopy first so small trees stay tappable. */
export function plotTrees(trees: MapTree[]): PlottedTree[] {
  const out: PlottedTree[] = []
  for (const t of trees) {
    const x = num(t.coord_x), y = num(t.coord_y)
    if (x === null || y === null) continue
    out.push({ ...t, x, y: -y, r: canopyRadius(t.height_m) })
  }
  return out.sort((a, b) => b.r - a.r)
}

export function getBounds(pts: { x: number; y: number }[]): Bounds {
  if (!pts.length) return { minX: 0, minY: -10, maxX: 10, maxY: 0 }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of pts) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY }
}

/** View that fits the bounds inside a w×h viewport with padding (px). */
export function fitView(b: Bounds, w: number, h: number, pad = 40): View {
  const spanX = Math.max(b.maxX - b.minX, 20), spanY = Math.max(b.maxY - b.minY, 20)
  const k = Math.max(0.01, Math.min((w - pad * 2) / spanX, (h - pad * 2) / spanY))
  return {
    k,
    tx: w / 2 - ((b.minX + b.maxX) / 2) * k,
    ty: h / 2 - ((b.minY + b.maxY) / 2) * k,
  }
}

export function healthBand(score: unknown) {
  const s = num(score)
  if (s === null) return null
  return HEALTH_BANDS.find(b => s >= b.min) ?? HEALTH_BANDS[HEALTH_BANDS.length - 1]
}

/** Grouping key of a tree under a colour mode. */
export function keyFor(t: MapTree, mode: ColorMode): string {
  if (mode === 'action') return t.action || 'pending'
  if (mode === 'health') return healthBand(t.health_score)?.key ?? 'unscored'
  if (mode === 'zone') return t.zone_code || 'none'
  return (t.display_name || '').trim() || 'unknown'
}

/** Legend for the trees on the map: only groups that are present, with counts. */
export function buildLegend(trees: MapTree[], mode: ColorMode): LegendItem[] {
  const counts = new Map<string, number>()
  for (const t of trees) { const k = keyFor(t, mode); counts.set(k, (counts.get(k) || 0) + 1) }

  if (mode === 'action') {
    const known = Object.keys(ACTION_COLORS).filter(k => counts.has(k))
    const extra = [...counts.keys()].filter(k => !(k in ACTION_COLORS))
    return [...known, ...extra].map(k => ({
      key: k, label: cap(k), color: ACTION_COLORS[k] || NEUTRAL_COLOR, count: counts.get(k)!,
    }))
  }
  if (mode === 'health') {
    const items: LegendItem[] = HEALTH_BANDS.filter(b => counts.has(b.key))
      .map(b => ({ key: b.key, label: b.label, color: b.color, count: counts.get(b.key)! }))
    if (counts.has('unscored')) items.push({ key: 'unscored', label: 'Not scored', color: NEUTRAL_COLOR, count: counts.get('unscored')! })
    return items
  }
  const blank = mode === 'zone' ? 'none' : 'unknown'
  const named = [...counts.keys()].filter(k => k !== blank)
    .sort((a, b) => mode === 'zone' ? a.localeCompare(b) : counts.get(b)! - counts.get(a)! || a.localeCompare(b))
  const items: LegendItem[] = named.map((k, i) => ({
    key: k,
    label: mode === 'zone' ? `Zone ${k}` : k,
    color: i < CATEGORY_COLORS.length ? CATEGORY_COLORS[i] : NEUTRAL_COLOR,
    count: counts.get(k)!,
  }))
  if (counts.has(blank)) items.push({ key: blank, label: mode === 'zone' ? 'No zone' : 'Unknown', color: NEUTRAL_COLOR, count: counts.get(blank)! })
  return items
}

/** Convex hull (monotone chain). Returns the input when it has fewer than 3 points. */
export function convexHull(points: Point[]): Point[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (p.length < 3) return p
  const cross = (o: Point, a: Point, b: Point) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: Point[] = []
  for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q) }
  const upper: Point[] = []
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q) }
  return lower.slice(0, -1).concat(upper.slice(0, -1))
}

/**
 * land_zones.boundary_coords, when someone has filled it in.
 * Accepts [[x,y],…] or [{x,y},…] (also as a JSON string); anything else → null.
 * Returned in plotted space (Y negated).
 */
export function parseBoundary(raw: unknown): Point[] | null {
  let v = raw
  if (typeof v === 'string') { try { v = JSON.parse(v) } catch { return null } }
  if (!Array.isArray(v) || v.length < 3) return null
  const out: Point[] = []
  for (const item of v) {
    const x = num(Array.isArray(item) ? item[0] : (item as any)?.x)
    const y = num(Array.isArray(item) ? item[1] : (item as any)?.y)
    if (x === null || y === null) return null
    out.push([x, -y])
  }
  return out
}

/** A round scale-bar length (metres) that is at most maxPx wide at zoom k. */
export function niceScale(k: number, maxPx = 120): { metres: number; px: number } {
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
  let m = steps[0]
  for (const s of steps) if (s * k <= maxPx) m = s
  return { metres: m, px: Math.round(m * k) }
}

/** Grid step (metres) so lines sit at least minPx apart at zoom k. */
export function gridStep(k: number, minPx = 48): number {
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
  return steps.find(s => s * k >= minPx) ?? steps[steps.length - 1]
}

/** Typical distance (m) from a tree to its nearest neighbour; decides when codes are shown. */
export function typicalSpacing(pts: { x: number; y: number }[]): number {
  if (pts.length < 2) return Infinity
  const stride = Math.max(1, Math.floor(pts.length / 250))
  const d: number[] = []
  for (let i = 0; i < pts.length; i += stride) {
    let best = Infinity
    for (let j = 0; j < pts.length; j++) {
      if (i === j) continue
      const dist = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
      if (dist < best) best = dist
    }
    d.push(best)
  }
  d.sort((a, b) => a - b)
  return d[Math.floor(d.length / 2)]
}
