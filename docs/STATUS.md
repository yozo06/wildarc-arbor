# Arbor: status

**Updated:** 2026-11-12

The [roadmap](superpowers/specs/2026-11-12-arbor-roadmap-design.md) is the plan. This page is the short
"where are we" note: what each branch holds, what was measured, and what it waits on. Update it whenever a
branch merges or a decision lands.

## Branches

Every figure below was measured with Node 20 after a clean `npm ci`, the same steps CI runs.

| Branch | What it holds | Checks | Waits on |
|---|---|---|---|
| `main` | The app as split out of `tms`, plus the roadmap, this page and `CLAUDE.md`. | Backend: type check clean; tests **8 pass, 1 fails** (the schema test the CI repair fixes). Frontend: type check clean, 12 of 12 tests, build succeeds. | Nothing. |
| `fix/ci-schema-test-and-cookie-ignore` | Repairs the failing schema test. Fixes the ignore rule for the browser-profile folder, which does not work on `main` because of a comment on the same line. | Backend: 9 of 9. | Nothing. **Merge first**, so everything else lands on a green `main`. |
| `feature/arbor-land-map` | The zoomable Land Map, the screen edits carried over from May, and the map's design note. | Frontend: type check clean, 39 of 39 tests, build succeeds. One React `act(...)` warning from the tree list tests, not a failure. Backend not touched. | A review, and a run against live farm data (it has only seen sample data). |
| `draft/biodiversity-endpoint` | `GET /api/dashboard/biodiversity`: richness, Shannon, Simpson and evenness for the standing trees, computed by `@wildarc/diversity`. Stacked on the CI repair branch. | Backend: 15 of 15. | See below. Not ready to publish or merge. |

### What the biodiversity branch waits on

1. The library `wildarc-diversity` being public with a `v0.1.0` tag.
2. Its dependency line being re-pointed from a local path to that tag, with the lockfile regenerated.
3. A rename to `feature/arbor-biodiversity-endpoint`, to match `CONTRIBUTING.md`.
4. The Stage 0 access work. The endpoint answers any signed-in user and is not limited to one farm. That
   matches every other read in the app today, and it is exactly what Stage 0 tightens (roadmap section
   2.3, items 2 and 9). Decide which roles may read farm-wide figures as part of that work, then merge.

## Order of work

1. Merge the CI repair.
2. Stage 0 of the roadmap. Its first two jobs: take the database dump (question Q1), and tighten access
   as decision D8 sets out, with tests.
3. Land Map: run it against live data, fix what that shows, merge. Stage 1 then adds the tree drawer and
   the "log health" button on top of it.
4. Biodiversity endpoint, once the four points above are done.

## First publication

Neither this repository nor the library was on GitHub when this page was written. The order:

1. Library repository `wildarc-diversity`: `main`, then the tag `v0.1.0`.
2. This repository: `main`.
3. The CI repair branch and the Land Map branch, each as a pull request against `main`.
4. The biodiversity branch only after step 1 and its dependency re-point.
5. Hosting is pointed at this repository after Stage 0 (decision D7), not before.

## Open with the owner

- **Q1** Is the live Supabase project reachable, so the database can be dumped? Stage 0 starts here.
- **Q2** Is there a real tree inventory to load?
- **Q3** Which phones do the workers carry?
- **Q4** What permanent web address will the tree tags point to?
- May the farm's name appear in this repository? It is left out for now.
