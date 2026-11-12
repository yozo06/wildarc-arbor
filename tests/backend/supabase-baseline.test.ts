import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import bcrypt from 'bcryptjs'

// Loads supabase/migrations/20261113000000_baseline.sql and supabase/seed.sql into an in-memory Postgres (PGlite) and runs
// the reads the API makes. This proves the SQL is valid Postgres and the views answer; it does not run Supabase's
// own services (PostgREST, roles), which need the Supabase command line and Docker.
const root = resolve(__dirname, '../..')
const sql = (path: string) => readFileSync(resolve(root, path), 'utf8')

let db: PGlite
const rows = async <T = Record<string, unknown>>(q: string) => (await db.query<T>(q)).rows

beforeAll(async () => {
  db = new PGlite()
  await db.exec(sql('supabase/migrations/20261113000000_baseline.sql'))
  await db.exec(sql('supabase/seed.sql'))
}, 30000)

describe('the Supabase baseline and seed', () => {
  it('seed the made-up sample farm', async () => {
    const count = async (t: string) => (await rows<{ n: number }>(`select count(*)::int as n from public.${t}`))[0].n
    expect(await count('trees')).toBe(40)
    expect(await count('land_zones')).toBe(5)
    expect(await count('species')).toBe(12)
    expect(await count('tree_health_observations')).toBe(15)
    expect(await count('tree_activity_log')).toBe(20)
  })

  it('zone_summary answers per zone', async () => {
    const zones = await rows<{ zone_code: string; total_trees: number }>('select * from public.zone_summary order by zone_code')
    expect(zones).toHaveLength(5)
    expect(zones.reduce((n, z) => n + z.total_trees, 0)).toBe(40)
  })

  it('map_tree_view gives every tree a name and its zone', async () => {
    const trees = await rows<{ display_name: string; zone_code: string; coord_x: number }>('select * from public.map_tree_view')
    expect(trees).toHaveLength(40)
    expect(trees.every(t => t.display_name && t.zone_code && typeof t.coord_x === 'number')).toBe(true)
  })

  it('the local owner can sign in with the documented password', async () => {
    const [owner] = await rows<{ email: string; role: string; password_hash: string; is_active: boolean }>(
      "select * from public.users where email = 'owner@example.com'")
    expect(owner).toMatchObject({ role: 'owner', is_active: true })
    expect(await bcrypt.compare('arbor-local-only', owner.password_hash)).toBe(true)
  })

  it('new rows get fresh ids after the seed', async () => {
    const [zone] = await rows<{ id: number }>("insert into public.land_zones (zone_code, zone_name) values ('NEW', 'New') returning id")
    expect(zone.id).toBe(6)
    const [tree] = await rows<{ id: number; status: string; action: string }>(
      `insert into public.trees (tree_code, zone_id) values ('NEW-001', ${zone.id}) returning id, status, action`)
    expect(tree).toEqual({ id: 41, status: 'pending', action: 'pending' })
  })

  it('refuses values the screens never send', async () => {
    await expect(db.query("insert into public.trees (tree_code, action) values ('BAD-1', 'burn')")).rejects.toThrow()
    await expect(db.query("insert into public.trees (tree_code, health_score) values ('BAD-2', 11)")).rejects.toThrow()
  })

  it('turns on row-level security for every table, so only the API (service key) can reach the data', async () => {
    const open = await rows<{ relname: string }>(
      "select relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity")
    expect(open).toEqual([])
  })
})
