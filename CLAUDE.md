# Arbor

Arbor is the tree management app of the WildArc project: a farm's trees, their health, the work done on
them, and a map of where they stand. AGPL-3.0. It was split out of the `yozo06/tms` repository in November
2026 and is developed here on its own.

## Read first

1. `docs/STATUS.md`: what each branch holds, what was measured, what it waits on. Short, and kept current.
   Its "Direction" section, set by the owner on 2026-11-12, comes before the roadmap: the next version runs
   on a phone with no account and no server. Re-plan with the owner before starting Stage 0.
2. `docs/superpowers/specs/2026-11-12-arbor-roadmap-design.md`: the approved roadmap. Six stages, the
   decisions D1 to D8, and the questions still open with the owner.
3. `docs/designs/`: screen specifications.
4. `CONTRIBUTING.md`: branch names, commit style, pull requests.

## The one rule

**The app records and shows; the libraries calculate.** Any figure with a formula behind it (biodiversity
indices, biomass, carbon) is computed by a `@wildarc/*` library, which names its source for every formula.
Arbor stores observations, calls the library and displays the answer. It does not carry its own copy of a
formula.

## Commands

Use **Node 20**, the version CI pins. Node 26 breaks some frontend tests. Node 20 is past its end of life;
moving to 24 is on the housekeeping list in `docs/STATUS.md`.

Backend, from the repository root:

```bash
npm ci
npx tsc --noEmit
npm run test:backend
npm run dev
```

Frontend, from `frontend/`:

```bash
npm ci
npx tsc --noEmit
npx vitest run
npm run build
```

CI runs exactly these checks (without `npm run dev`) on every pull request and push to `main`.

## Layout

- `src/`: the backend. Express and TypeScript on Supabase.
  - `src/app.ts` mounts everything under `/api`.
  - `src/core/`: configuration, the Supabase client, the `authenticate` and `validate` middleware.
  - `src/modules/auth/`: sign-in, sign-up, users.
  - `src/modules/arbor/`: routes for trees, map, species, zones and dashboard, plus the zod schemas.
- `frontend/`: a React, Vite, Tailwind and Zustand app that installs on a phone.
  - `frontend/src/core/`: layout, sign-in pages, the auth store, shared constants.
  - `frontend/src/modules/arbor/`: the Arbor pages, components and API calls.
  - `frontend/src/settings/`: employees and profile.
- `docs/migrations/`: SQL files. Incomplete; see below.

## Things that will trip you up

- **Legacy duplicates.** `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/store/` and
  `frontend/src/api/` are older copies that no route uses. Edit the versions under `core/`, `modules/` and
  `settings/`. Stage 0 deletes the old folders.
- **The database cannot be rebuilt from this repository.** The base tables were made by hand in Supabase
  Studio. The code reads `map_tree_view` and `ecosystem_roles`, which no migration creates, and migrations
  004, 006 and 007 are absent. Stage 0 starts with a dump of the live project. Until that lands, do not
  assume a column or a view exists because a migration file mentions it.
- **The backend talks to Supabase with the service key.** Row-level rules in the database do not protect
  anything by themselves. Every route has to check who is asking, and for which farm.
- **Supabase returns at most 1000 rows per request.** A list read without paging goes short silently. Ask
  for the exact count and compare, or page.
- **There is no `npm run lint` script.** Type checking and tests are the gate for now.

## How we work here

- Branch off `main`, named as `CONTRIBUTING.md` says (`feature/arbor-...`, `fix/...`, `docs/...`).
  Conventional Commits. Pull requests against `main`.
- Tests first: write the failing test, watch it fail, then make it pass.
- One roadmap stage at a time. A stage's implementation plan is written when the stage starts and lives
  under `docs/superpowers/plans/`.
- Never commit `.env`, keys, or a browser profile folder.
- When a branch merges or a decision lands, update `docs/STATUS.md` in the same pull request.
- The farm's name stays out of the repository until the owner says otherwise.
