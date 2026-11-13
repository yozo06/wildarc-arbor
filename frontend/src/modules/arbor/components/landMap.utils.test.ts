import { describe, it, expect } from 'vitest'
import { buildLegend, convexHull, fitView, getBounds, niceScale, parseBoundary, plotTrees, type MapTree } from './landMap.utils'

const tree = (o: Partial<MapTree>): MapTree => ({ id: 1, tree_code: 'A-001', action: 'keep', ...o })

describe('plotTrees', () => {
  it('keeps trees with coordinates (including 0) and flips Y', () => {
    const pts = plotTrees([
      tree({ id: 1, coord_x: 0, coord_y: 0 }),
      tree({ id: 2, coord_x: '12.5', coord_y: 30 }),
      tree({ id: 3, coord_x: null, coord_y: 4 }),
      tree({ id: 4 }),
    ])
    expect(pts.map(p => p.id).sort()).toEqual([1, 2])
    expect(pts.find(p => p.id === 2)).toMatchObject({ x: 12.5, y: -30 })
  })
})

describe('fitView', () => {
  it('centres the bounds in the viewport', () => {
    const b = getBounds([{ x: 0, y: -100 }, { x: 200, y: 0 }])
    const v = fitView(b, 400, 400, 0)
    expect(v.k).toBe(2)
    expect(100 * v.k + v.tx).toBe(200)
    expect(-50 * v.k + v.ty).toBe(200)
  })
  it('does not blow up for a single tree', () => {
    const v = fitView(getBounds([{ x: 5, y: -5 }]), 360, 520)
    expect(Number.isFinite(v.k)).toBe(true)
    expect(v.k).toBeGreaterThan(0)
  })
})

describe('buildLegend', () => {
  const trees = [
    tree({ id: 1, action: 'treat', health_score: 3, zone_code: 'B', display_name: 'Mango' }),
    tree({ id: 2, action: 'replant', health_score: 9, zone_code: 'A', display_name: 'Mango' }),
    tree({ id: 3, action: 'keep', zone_code: 'A', display_name: 'Jackfruit' }),
  ]
  it('includes treat and replant when they are on the map', () => {
    expect(buildLegend(trees, 'action').map(l => l.key).sort()).toEqual(['keep', 'replant', 'treat'])
  })
  it('bands health and reports unscored trees', () => {
    expect(buildLegend(trees, 'health').map(l => [l.key, l.count])).toEqual([['thriving', 1], ['poor', 1], ['unscored', 1]])
  })
  it('sorts zones by code and species by count', () => {
    expect(buildLegend(trees, 'zone').map(l => [l.key, l.count])).toEqual([['A', 2], ['B', 1]])
    expect(buildLegend(trees, 'species')[0]).toMatchObject({ key: 'Mango', count: 2 })
  })
})

describe('zone shapes', () => {
  it('convexHull drops interior points', () => {
    expect(convexHull([[0, 0], [4, 0], [4, 4], [0, 4], [2, 2]])).toHaveLength(4)
  })
  it('parseBoundary accepts pairs, objects and JSON strings, rejects junk', () => {
    expect(parseBoundary([[0, 0], [1, 0], [1, 2]])).toEqual([[0, -0], [1, -0], [1, -2]])
    expect(parseBoundary('[{"x":0,"y":0},{"x":1,"y":0},{"x":1,"y":2}]')).toHaveLength(3)
    expect(parseBoundary(null)).toBeNull()
    expect(parseBoundary('not json')).toBeNull()
    expect(parseBoundary([[0, 0], [1, 1]])).toBeNull()
  })
})

describe('niceScale', () => {
  it('picks a round length that fits', () => {
    expect(niceScale(2, 120)).toEqual({ metres: 50, px: 100 })
  })
})
