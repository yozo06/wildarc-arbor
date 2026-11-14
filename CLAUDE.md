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

Use **Node 26**, the current long-term version and the one CI uses (`.nvmrc` says so). Node 24 also passes.
From Node 25 on, Node has its own `localStorage`, which hides the browser one the frontend tests need, so
`frontend/vite.config.ts` switches Node's off for tests. Keep that line.

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
npm run build          # the phone version
npm run dev            # the phone version, no server needed
npm run dev:server     # the same screens against the API on port 3000
```

CI runs exactly these checks (without `npm run dev`) on every pull request and push to `main`.

## Layout

- `src/`: the backend. Express and TypeScript on Supabase.
  - `src/app.ts` mounts everything under `/api`.
  - `src/core/`: configuration, the Supabase client, the `authenticate` and `validate` middleware.
  - `src/modules/auth/`: sign-in, sign-up, users.
  - `src/modules/arbor/`: routes for trees, map, species, zones and dashboard, plus the zod schemas.
- `frontend/`: a React, Vite, Tailwind and Zustand app that installs on a phone.
  - `frontend/src/core/`: layout, sign-in and welcome pages, the auth store, shared constants.
  - `frontend/src/core/data/`: `mode.ts` (`VITE_DATA_MODE`: `local` by default, `server` for the hosted
    build) and `local/`, the phone version of every data function: IndexedDB store, trees and logs, photos,
    the farm file, the sample farm.
  - `frontend/src/core/phone/`: install, persistent storage, the save reminder, farm-change events.
  - `frontend/src/core/pwa/manifest.ts`: the web app manifest. Icons come from `scripts/make-icons.mjs`.
  - `frontend/src/modules/arbor/`: the Arbor pages and components. `api/` exports, for each function, the
    local or the server version, picked at build time.
  - `frontend/src/settings/`: profile, the "Your farm" card, and employees (server version only).
- `docs/migrations/`: SQL files. Incomplete; see below.

## Things that will trip you up

- **Two data modes, one set of screens.** `npm run dev` is the phone version: data in IndexedDB (database
  `arbor`), no sign-in, no team. Local functions must return exactly the shapes the server returns
  (`docs/superpowers/plans/2026-11-13-arbor-phone-first.md`, Appendix A) so screens never need to know.
- **The farm file is forever.** `farm.json` carries `format: "arbor-farm"` and `version: 1`. Every later
  Arbor must still open version 1; add a version, never change the meaning of an old one.
- **jsdom cannot read or copy a `Blob`.** Photos are stored as bytes with their type, and the canvas work that
  shrinks them is swapped out in tests (`setImageShrinker`). Check photo changes in a real browser.
- **The sample farm is generated.** Edit `frontend/scripts/make-sample-farm.mjs` and run it; never hand-edit
  `sample-farm.json`. It must stay made up.

- **Legacy duplicates.** `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/store/` and
  `frontend/src/api/` are older copies that no route uses. Edit the versions under `core/`, `modules/` and
  `settings/`. Stage 0 deletes the old folders.
- **The server database is a reconstruction.** The live tables were made by hand in Supabase Studio and never
  written down. `supabase/migrations/20261113000000_baseline.sql` rebuilds them from what the API reads and
  writes; `docs/migrations/` holds the older, incomplete files. If the live project is ever dumped, compare
  and keep the dump. Change the schema with a new migration file, never by editing the baseline, and regenerate
  the seed with `node scripts/make-seed.mjs`. `tests/backend/supabase-baseline.test.ts` loads both into an
  in-memory Postgres.
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
