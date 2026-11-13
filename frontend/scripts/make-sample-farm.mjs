// Writes src/core/data/local/sample-farm.json: a made-up farm, "Sample Food Forest", in the farm file format
// (version 1, no photos). Deterministic: the same seed always gives the same farm.
// Run from frontend/: node scripts/make-sample-farm.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const OUT = fileURLToPath(new URL('../src/core/data/local/sample-farm.json', import.meta.url))

let seed = 20261113
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648)
const pick = list => list[Math.floor(rand() * list.length)]
const between = (lo, hi, step = 1) => Math.round((lo + rand() * (hi - lo)) / step) * step
const day = n => new Date(Date.UTC(2026, 9, 1) + n * 86400000).toISOString()

// Outlines in metres on a 120 m by 90 m plot; y grows north.
const zones = [
  { zone_code: 'NORTH', zone_name: 'North Orchard', boundary_coords: [[2, 62], [70, 62], [70, 88], [2, 88]] },
  { zone_code: 'SOUTH', zone_name: 'South Food Forest', boundary_coords: [[2, 2], [70, 2], [70, 30], [2, 30]] },
  { zone_code: 'EAST', zone_name: 'East Windbreak', boundary_coords: [[76, 2], [118, 2], [118, 88], [76, 88]] },
  { zone_code: 'WEST', zone_name: 'West Nursery', boundary_coords: [[2, 34], [28, 34], [28, 58], [2, 58]] },
  { zone_code: 'POND', zone_name: 'Pond Edge', boundary_coords: [[36, 35], [64, 35], [69, 46], [61, 57], [40, 57], [32, 46]] },
].map((z, i) => ({ id: i + 1, uid: `sample-zone-${i + 1}`, ...z, description: null, project_id: null }))

const species = [
  ['Mango', 'Mangifera indica'], ['Jackfruit', 'Artocarpus heterophyllus'], ['Coconut', 'Cocos nucifera'],
  ['Banana', 'Musa acuminata'], ['Papaya', 'Carica papaya'], ['Guava', 'Psidium guajava'],
  ['Moringa', 'Moringa oleifera'], ['Neem', 'Azadirachta indica'], ['Tamarind', 'Tamarindus indica'],
  ['Jamun', 'Syzygium cumini'], ['Custard apple', 'Annona squamosa'], ['Gliricidia', 'Gliricidia sepium'],
].map(([common_name, scientific_name], i) => ({
  id: i + 1, uid: `sample-species-${i + 1}`, common_name, scientific_name, description: null, fun_fact: null,
}))
const sp = name => species.find(s => s.common_name === name).id

// How many trees each zone gets, and which species grow there.
const plan = [
  ['NORTH', 10, ['Mango', 'Jackfruit', 'Guava', 'Custard apple']],
  ['SOUTH', 10, ['Banana', 'Papaya', 'Coconut', 'Moringa']],
  ['EAST', 8, ['Neem', 'Tamarind', 'Gliricidia']],
  ['WEST', 6, ['Moringa', 'Papaya', 'Guava']],
  ['POND', 6, ['Jamun', 'Coconut', 'Banana']],
]

function inside([x, y], poly) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

function pointIn(poly) {
  const xs = poly.map(p => p[0]), ys = poly.map(p => p[1])
  for (;;) {
    const p = [between(Math.min(...xs) + 1, Math.max(...xs) - 1, 0.5), between(Math.min(...ys) + 1, Math.max(...ys) - 1, 0.5)]
    if (inside(p, poly)) return p
  }
}

const ACTIONS = ['keep', 'keep', 'keep', 'monitor', 'monitor', 'trim', 'trim', 'cut', 'treat', 'replant', 'pending']
const STATUSES = ['pending', 'pending', 'pending', 'in_progress', 'completed', 'completed', 'on_hold']
// A few trees with a name of their own; the species always matches the name.
const NAMED = {
  'NORTH-001': ['Old mango by the gate', 'Mango'], 'POND-002': ['Leaning coconut', 'Coconut'], 'EAST-004': ['Big neem', 'Neem'],
}

const trees = []
for (const [code, count, kinds] of plan) {
  const zone = zones.find(z => z.zone_code === code)
  for (let n = 1; n <= count; n++) {
    const tree_code = `${code}-${String(n).padStart(3, '0')}`
    const [coord_x, coord_y] = pointIn(zone.boundary_coords)
    const status = pick(STATUSES)
    const created = day(between(0, 20))
    const [ownName, ownSpecies] = NAMED[tree_code] ?? [null, null]
    const kind = pick(kinds)
    trees.push({
      id: trees.length + 1, uid: `sample-tree-${trees.length + 1}`, tree_code, species_id: sp(ownSpecies ?? kind),
      zone_id: zone.id, custom_common_name: ownName, health_score: between(3, 10),
      action: pick(ACTIONS), status, priority: pick(['low', 'medium', 'medium', 'medium', 'high']),
      coord_x, coord_y, approx_age_yrs: between(1, 25), height_m: between(1, 12, 0.5),
      trunk_diameter_cm: between(5, 60), action_notes: null, public_notes: null,
      planting_date: rand() < 0.4 ? day(-between(365, 3650)).slice(0, 10) : null, assigned_to: null,
      added_by: 1, created_at: created, updated_at: created, completed_at: status === 'completed' ? day(30) : null,
    })
  }
}
trees.find(t => t.tree_code === 'POND-002').priority = 'urgent'
trees.find(t => t.tree_code === 'SOUTH-004').priority = 'urgent'

const LEAVES = ['healthy_green', 'healthy_green', 'pale', 'yellowing', 'spots']
const BARK = ['healthy', 'healthy', 'cracked', 'peeling', 'insect_damage']
const health = Array.from({ length: 15 }, (_, i) => {
  const t = pick(trees)
  return {
    id: i + 1, uid: `sample-health-${i + 1}`, tree_code: t.tree_code, observed_at: day(25 + i), observed_by: 1,
    health_score: t.health_score, height_m: t.height_m, leaf_color: pick(LEAVES), bark_condition: pick(BARK),
    pest_presence: rand() < 0.2, disease_signs: rand() < 0.1, additional_notes: null, notes: null, observed_issues: null,
  }
})

const WORK = [['watered', 'After a dry week'], ['trimmed', 'Lower branches off the path'], ['treated', 'Neem oil spray'], ['health_checked', null], ['replanted', 'Gap filled']]
const activity = Array.from({ length: 20 }, (_, i) => {
  const [action_taken, notes] = pick(WORK)
  return {
    id: i + 1, uid: `sample-activity-${i + 1}`, tree_code: pick(trees).tree_code, action_taken,
    previous_status: null, new_status: null, notes, logged_at: day(22 + i), logged_by: 1,
  }
})

const farm = {
  format: 'arbor-farm', version: 1, savedAt: day(41), farm: { name: 'Sample Food Forest' },
  owner: { id: 1, name: 'You', email: '', role: 'owner', phone: null, bio: null, is_active: true, created_at: day(0) },
  species, zones, trees, health, activity, photos: [],
}

writeFileSync(OUT, JSON.stringify(farm, null, 1) + '\n')
console.log(`wrote ${OUT}: ${trees.length} trees, ${zones.length} zones, ${species.length} species`)
