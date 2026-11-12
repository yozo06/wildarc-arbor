# Phone-first Arbor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The same Arbor screens run with data kept on the phone (IndexedDB), save and open a zip farm file, install from a GitHub Pages link with a sample farm to try, and keep a documented server version on Supabase.

**Architecture:** A build-time `VITE_DATA_MODE` (`local` by default, `server` for the hosted build) picks, for every data function the screens call, either today's axios version or a new local version over a small key-value store (IndexedDB, or memory when storage is blocked). Local versions return the server's JSON shapes (Appendix A), so screens change only where they are broken today. The farm file is a zip of `farm.json` plus JPEG photos, written and read with `fflate`.

**Tech Stack:** React 18, Vite 5, vite-plugin-pwa, zustand, Vitest 3 with jsdom, Node 26. New: `idb` (IndexedDB wrapper), `fflate` (zip), `fake-indexeddb` (tests only).

**Spec:** `docs/superpowers/specs/2026-11-12-arbor-phone-first-design.md` (approved 2026-11-13 with the defaults in its section 10).

## Global Constraints

- Node 26 for everything (`.nvmrc`); frontend commands run in `frontend/`.
- Branch `feature/arbor-phone-first`, which sits on `feature/arbor-land-map`. One commit or more per task. Never push from this machine. At publishing time the branch is cut into one pull request per design step at the commits named "Step N boundary" in the ledger.
- Tests first for every task that changes code: write the test, watch it fail, then make it pass. Full frontend suite (`npx vitest run`) green at the end of every task; `npx tsc --noEmit` clean.
- New runtime dependencies are limited to `idb` and `fflate`; new dev dependencies to `fake-indexeddb` (frontend) and `@electric-sql/pglite` (repository root, Task 11 only). Nothing else without a ledgered ruling.
- Biodiversity stays off the phone version until `@wildarc/diversity` is published with its `v0.1.0` tag (design 4.5); no task adds it.
- `local` is the default data mode. `server` only when `import.meta.env.VITE_DATA_MODE === 'server'`.
- No real farm, person or place names anywhere: sample data is "Sample Food Forest", made up.
- App name on screen and in the manifest: **Arbor**. Theme colour `#2A5934`, background `#F7F5EE`.
- Farm file: `arbor-farm-YYYY-MM-DD.zip` containing `farm.json` (`format: "arbor-farm"`, `version: 1`) and `photos/<id>.jpg`. Every future version must open version 1.
- Photos are shrunk before storing: longest side 1600 px, JPEG quality 0.85.
- Save nudge after 7 days. Pages address `https://yozo06.github.io/wildarc-arbor/` (base `/wildarc-arbor/`).
- Server behaviour does not change in this plan (design section 3). Server bugs found on the way go to `docs/STATUS.md` for step 6.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A farm file made by a newer Arbor (`version: 2`) is refused with "This farm file was made by a newer Arbor" and the phone's data is untouched. Test in Task 5.
2. A broken or half-valid farm file never leaves the phone half-replaced: replacement is one transaction across all stores. Test in Task 5.
3. Phone storage full while saving a photo or tree (`QuotaExceededError`) shows "Phone storage is full. Save your farm to a file, then remove some photos." and writes nothing partial. Test in Task 7.
4. Tree codes typed in lower case are stored upper case, and a second tree with the same code is refused with "Tree code T-001 already exists". Test in Task 2.
5. While the sample farm is loaded, "Start my farm" and "Clear sample" both empty every store and reset the sample flag, so sample trees never mix with real ones. Test in Task 6.

---

### Task 1: Data mode, the local store, and local errors

**Files:**
- Create: `frontend/src/core/data/mode.ts`, `frontend/src/core/data/local/store.ts`, `frontend/src/core/data/local/errors.ts`
- Test: `frontend/src/core/data/local/store.test.ts`
- Modify: `frontend/package.json` (add `idb`, `fflate`, dev `fake-indexeddb`), `frontend/src/setupTests.ts` (import `fake-indexeddb/auto`)

**Interfaces:**
- Produces:
  - `DATA_MODE: 'local' | 'server'` and `isLocal(): boolean` (mode.ts)
  - `type StoreName = 'trees' | 'species' | 'zones' | 'health' | 'activity' | 'photos' | 'meta'`
  - `interface LocalStore { all<T>(s: StoreName): Promise<T[]>; get<T>(s: StoreName, key: number | string): Promise<T | undefined>; put<T>(s: StoreName, value: T): Promise<void>; remove(s: StoreName, key: number | string): Promise<void>; nextId(s: StoreName): Promise<number>; replaceAll(data: Partial<Record<StoreName, unknown[]>>): Promise<void>; kind: 'indexeddb' | 'memory' }`
  - `getStore(): Promise<LocalStore>` (opens IndexedDB `arbor`, version 1; falls back to memory if opening throws), `createMemoryStore(): LocalStore`, `resetStoreForTests(store?: LocalStore): void`
  - Keys: trees by `tree_code`; meta by `key`; every other store by numeric `id`. Indexes `by_tree` on `tree_code` for health, activity, photos.
  - `class LocalDataError extends Error { response: { status: number; data: { error: string } } }` and `fail(status: number, message: string): never` (errors.ts). Screens read `err.response?.data?.error`, so this shape is required.
  - `newUid(): string` (`crypto.randomUUID()`), stored as `uid` on every record for a later sync (design section 8).

- [ ] **Step 1: Write the failing tests** (`store.test.ts`, run against both `createMemoryStore()` and the IndexedDB store via `fake-indexeddb`):
  - `put then get returns the record`; `all returns every record`; `remove deletes`.
  - `nextId starts at 1 and increases per store` (`await nextId('species')` → 1, then 2; `nextId('zones')` → 1).
  - `replaceAll is all-or-nothing`: put a tree, call `replaceAll({ trees: [{ tree_code: undefined }] })` (invalid key) → rejects, and the original tree is still there.
  - `getStore falls back to memory when IndexedDB throws`: stub `indexedDB.open` to throw → `kind === 'memory'`.
- [ ] **Step 2: Run** `npx vitest run src/core/data/local/store.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3: Install** `npm install idb fflate` and `npm install -D fake-indexeddb`; implement `mode.ts`, `store.ts`, `errors.ts`. `replaceAll` uses one `readwrite` transaction over all named stores (clear, then put) in IndexedDB, and builds new maps before swapping in the memory store.
- [ ] **Step 4: Run** the same command, then the full suite. Expected: PASS; suite 39 + new tests green.
- [ ] **Step 5: Commit** `feat(frontend): local data store and data-mode switch`.

### Task 2: Local trees, species, zones, map and dashboard

**Files:**
- Create: `frontend/src/core/data/local/farm.ts`
- Test: `frontend/src/core/data/local/farm.test.ts`

**Interfaces:**
- Consumes: Task 1 (`getStore`, `fail`, `newUid`).
- Produces (same names and arguments as the server versions, returning Appendix A shapes): `getTrees(params?)`, `getTree(code)`, `createTree(data)`, `updateTree(code, data)`, `deleteTree(code)`, `getSpecies()`, `createSpecies(data)`, `getEcosystemRoles()` (returns `[]`), `getZones()`, `createZone(data)`, `getMapTrees()`, `getMapZones()`, `getDashboardStats()`, `getPublicTree(code)`.
- Also `coerceTreeInput(data: Record<string, unknown>): Record<string, unknown>`: strings to numbers for `species_id, zone_id, assigned_to, health_score, approx_age_yrs, height_m, trunk_diameter_cm, coord_x, coord_y`; `''` to `null`; `tree_code` and `zone_code` upper-cased and trimmed.

- [ ] **Step 1: Write the failing tests:**
  - `createTree upper-cases the code and refuses a duplicate`: create `t-001` → stored as `T-001`; creating `T-001` again rejects with `response.data.error === 'Tree code T-001 already exists'`.
  - `createTree without a code makes ZONECODE-NNN`: zone `{zone_code:'NORTH'}` with trees `NORTH-001`, `NORTH-002` → next is `NORTH-003`; no zone and no code → rejects "Choose a zone or enter a tree code".
  - `createTree logs tree_created`: one activity row `{action_taken:'tree_created', new_status:'pending'}`.
  - `getTrees filters and pages like the server`: `zone` (id as string), `action`, `status`, `priority`, `search` (case-insensitive on `tree_code` only), `page`/`limit` (default 50), sorted by `tree_code`; returns `{ trees, total, page }` with `species{common_name, scientific_name, ecosystem_roles}`, `land_zones{zone_code, zone_name}`, `assigned_user` null.
  - `updateTree to completed sets completed_at and logs status_changed` with `previous_status`, `new_status`, `notes` = `log_notes`; `updateTree` with no known fields rejects "No valid fields to update".
  - `getZones returns zone_summary rows` with `total_trees` and `completed` counts.
  - `getMapTrees returns the map view shape`: `display_name` = `custom_common_name` or species `common_name` or `tree_code`; `zone_code` from the zone.
  - `getDashboardStats counts` `total, pending, inProgress, completed, toCut, toTrim, urgent` and returns `zones` as in `getZones`.
- [ ] **Step 2: Run** `npx vitest run src/core/data/local/farm.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** in `farm.ts`. Each test resets with `resetStoreForTests(createMemoryStore())`.
- [ ] **Step 4: Run** the file, then the full suite. Expected: PASS.
- [ ] **Step 5: Commit** `feat(frontend): trees, species, zones, map and dashboard on the phone`.

### Task 3: Local health, work log, owner profile and the rest

**Files:**
- Create: `frontend/src/core/data/local/logs.ts`, `frontend/src/core/data/local/owner.ts`
- Test: `frontend/src/core/data/local/logs.test.ts`, `frontend/src/core/data/local/owner.test.ts`

**Interfaces:**
- Produces: `getHealth(code)`, `addHealth(code, data)`, `getActivity(code)`, `addActivity(code, action_taken, notes?)`, `getContributors(code)` (returns `[]`), `addContributor()` (rejects "Not available on the phone version"), and in `owner.ts`: `LOCAL_OWNER_ID = 1`, `getOwner(): Promise<LocalOwner>`, `getUsers()` (returns `[owner]`), `updateUser(id, data)`, `createUser()`/`deactivateUser()` (reject as above), `getMe()`.
- `LocalOwner = { id: 1, name: string, email: '', role: 'owner', phone: string | null, bio: string | null, is_active: true, created_at: string }`; stored in `meta` under key `owner`; default name `'You'`.

- [ ] **Step 1: Write the failing tests:**
  - `addHealth keeps every field the form sends` (`health_score, leaf_color, bark_condition, pest_presence, disease_signs, height_m, additional_notes`), sets `observed_at`, sets the tree's `health_score`, and `getHealth` returns newest first with `users:{name}` of the owner.
  - `addHealth refuses a score outside 1 to 10` with "Health score must be between 1 and 10".
  - `getActivity returns newest logged_at first, at most 100`.
  - `updateUser changes name, phone and bio of the owner only`; `updateUser(2, …)` rejects with status 403.
- [ ] **Step 2: Run** both files. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** both files and the full suite. Expected: PASS.
- [ ] **Step 5: Commit** `feat(frontend): health, work log and owner profile on the phone`.

### Task 4: Wire the screens to the data mode (Step 1 boundary)

**Files:**
- Modify: `frontend/src/modules/arbor/api/{trees,species,dashboard,map}.ts`, `frontend/src/settings/api/users.ts`, `frontend/src/core/api/auth.ts` (each export chooses the local or the server function from `DATA_MODE`; server bodies unchanged)
- Modify: `frontend/src/modules/arbor/pages/Dashboard.tsx` (use `../api/dashboard`, `../api/trees` and `core/store/auth.store`, not the legacy `frontend/src/api` and `frontend/src/store`)
- Modify: `frontend/src/core/store/auth.store.ts` (in local mode the initial state is `{ user: owner as {id:1,name,email:'',role:'owner'}, token: 'local', refreshToken: null }`)
- Modify: `frontend/src/App.tsx` (local mode: `/login` and `/signup` redirect to `/home`), `frontend/src/core/components/BottomNav.tsx` (no Team in local mode), `frontend/src/settings/pages/Profile.tsx` (local mode: no password change, no sign-out; name/phone/bio save through `updateUser`)
- Modify: `frontend/src/modules/arbor/pages/TreeDetail.tsx` (read `photo_url` and `taken_at`, `logged_at`; show health as a score out of 10 with bands at 4 and 7), and the same health display in `TreeCard.tsx` if it uses a percentage
- Modify: `frontend/package.json` scripts: `"dev:server": "vite --mode server"`, `"build:server": "vite build --mode server"`; create `frontend/.env.server` with `VITE_DATA_MODE=server`; root `package.json` `build:frontend` uses `npm run build:server`; `render.yaml` client `buildCommand` unchanged (it calls `build:frontend`)
- Test: `frontend/src/core/data/mode.test.tsx`, `frontend/src/modules/arbor/pages/Dashboard.test.tsx`

**Interfaces:**
- Consumes: Tasks 1 to 3.
- Produces: screens running on local data with no sign-in when `DATA_MODE === 'local'`.
- Local functions are wrapped so a `LocalDataError` also shows `toast.error(message)`, as the axios interceptor does for the server (HealthLog and ActivityLog rely on it).

- [ ] **Step 1: Write the failing tests:**
  - `Dashboard reads the module API and the current auth store`: mock `../api/dashboard` and `../api/trees`; assert they are called and the owner's name from `core/store/auth.store` renders.
  - `in local mode the app opens Home without signing in`: render `<App/>` at `/login` with the local store holding one tree; assert the route becomes `/home` and the Dashboard shows a total of 1.
  - `TreeDetail shows the photo from photo_url` and `shows health 7 as 7/10`.
- [ ] **Step 2: Run** the new tests. Expected: FAIL.
- [ ] **Step 3: Implement** the file list above.
- [ ] **Step 4: Run** the full suite and `npx tsc --noEmit`; run `npm run build` and `npm run build:server`. Expected: all pass; both builds succeed.
- [ ] **Step 5: Manual check** in the browser: `npm run dev`, add a zone, a species, a tree, log health and work, open the Land Map; reload and see them still there.
- [ ] **Step 6: Commit** `feat(frontend): screens run on phone storage by default`. Ledger: "Step 1 boundary".

### Task 5: The farm file

**Files:**
- Create: `frontend/src/core/data/local/farmFile.ts`
- Test: `frontend/src/core/data/local/farmFile.test.ts`

**Interfaces:**
- Consumes: Task 1 store.
- Produces:
  - `FARM_FORMAT = 'arbor-farm'`, `FARM_VERSION = 1`
  - `interface FarmData { format: 'arbor-farm'; version: 1; savedAt: string; owner: LocalOwner; species: unknown[]; zones: unknown[]; trees: unknown[]; health: unknown[]; activity: unknown[]; photos: Array<{ id: number; tree_code: string; photo_type: string; caption: string | null; taken_at: string; file: string }> }`
  - `exportFarm(now?: Date): Promise<{ blob: Blob; filename: string }>` (sets `meta.lastSavedAt`)
  - `readFarmFile(file: Blob): Promise<{ summary: { trees: number; photos: number; savedAt: string }; apply: () => Promise<void> }>` (validates fully before returning; `apply` calls `replaceAll`, sets `meta.lastSavedAt = savedAt`, `meta.sample = false`)
  - `validateFarmData(json: unknown): FarmData` (throws `LocalDataError` 400 with a plain message)
- `farm.json` written at compression level 6; photos at level 0.

- [ ] **Step 1: Write the failing tests:**
  - `export then read round-trips` trees, species, zones, health, activity, owner and two photos byte for byte.
  - `refuses a newer version`: `version: 2` → "This farm file was made by a newer Arbor. Update Arbor and try again."; store unchanged.
  - `refuses something that is not a farm file`: a zip without `farm.json`, and a non-zip → "This is not an Arbor farm file."
  - `a photo listed but missing from the zip` → refused, store unchanged.
  - `apply replaces everything in one go`: existing tree `OLD-001` is gone after apply; `meta.lastSavedAt` equals the file's `savedAt`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** with `zipSync`/`unzipSync` from `fflate`.
- [ ] **Step 4: Run** the file and full suite. Expected: PASS.
- [ ] **Step 5: Commit** `feat(frontend): save and open a farm file`.

### Task 6: The sample farm

**Files:**
- Create: `frontend/scripts/make-sample-farm.mjs` (deterministic; writes the JSON below), `frontend/src/core/data/local/sample-farm.json` (a `farm.json` v1 with no photos), `frontend/src/core/data/local/sample.ts`
- Test: `frontend/src/core/data/local/sample.test.ts`

**Interfaces:**
- Produces: `loadSampleFarm(): Promise<void>` (runs `validateFarmData` then `replaceAll`, sets `meta.sample = true`, does not set `lastSavedAt`), `clearFarm(): Promise<void>` (empties every store, `meta.sample = false`), `isSampleLoaded(): Promise<boolean>`.
- Sample content: farm "Sample Food Forest"; 5 zones (`NORTH`, `SOUTH`, `EAST`, `WEST`, `POND`) with `boundary_coords` polygons in metres that `parseBoundary` in `landMap.utils.ts` accepts; 12 species with common and scientific names of common tropical food-forest trees; 40 trees with coordinates inside their zones, a mix of actions (`cut`, `trim`, `treat`, `monitor`, `none`), statuses and health 3 to 10; 15 health entries and 20 work entries.

- [ ] **Step 1: Write the failing tests:**
  - `the sample file is a valid farm file` (`validateFarmData` passes; 40 trees, 5 zones, 12 species).
  - `every sample tree sits inside its zone` (use `parseBoundary` and a point-in-polygon check).
  - `loadSampleFarm then clearFarm leaves every store empty and the sample flag false`.
  - `the sample is labelled as made up`: `owner.name` is "Sample Food Forest" and every tree code starts with a sample zone code.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Write the generator, run it** (`node scripts/make-sample-farm.mjs`), implement `sample.ts`.
- [ ] **Step 4: Run** the file and full suite. Expected: PASS.
- [ ] **Step 5: Commit** `feat(frontend): a made-up sample farm to try Arbor with`.

### Task 7: Phone screens: welcome, install, banners and the farm card (Step 2 boundary)

**Files:**
- Create: `frontend/src/core/phone/install.ts`, `frontend/src/core/phone/persist.ts`, `frontend/src/core/phone/nudge.ts`, `frontend/src/core/pages/Welcome.tsx`, `frontend/src/core/components/PhoneBanners.tsx`, `frontend/src/settings/components/FarmFileCard.tsx`
- Modify: `frontend/src/App.tsx` (route `/welcome`; in local mode `HomeRedirect` sends to `/welcome` while the farm is empty and not started), `frontend/src/core/components/Layout.tsx` (render `PhoneBanners` in local mode), `frontend/src/settings/pages/Profile.tsx` (render `FarmFileCard` in local mode)
- Test: `frontend/src/core/phone/install.test.ts`, `frontend/src/core/phone/nudge.test.ts`, `frontend/src/core/pages/Welcome.test.tsx`, `frontend/src/settings/components/FarmFileCard.test.tsx`

**Interfaces:**
- `isIos(nav = navigator): boolean` (iPhone, iPad, iPod, or `MacIntel` with touch points > 1); `isInstalled(win = window): boolean` (`display-mode: standalone` or `navigator.standalone`); `captureInstallPrompt()`, `canPromptInstall()`, `promptInstall()` around `beforeinstallprompt`.
- `requestPersistence(): Promise<boolean>`: calls `navigator.storage?.persist?.()` once per session after the first local write (hook it into the local store's `put`).
- `shouldNudge({ lastSavedAt, startedAt, treeCount, sample }, now): boolean`: true when `treeCount > 0`, not `sample`, and `now - (lastSavedAt ?? startedAt) > 7 days`.
- Welcome copy: "Start my farm", "Look around the sample farm"; on iPhone not installed, first card "Add Arbor to your Home Screen first: tap Share, then Add to Home Screen. A farm started in Safari stays in Safari and can be deleted after a week." with "Continue in Safari anyway".
- Banners: memory store → "This browser is not keeping your farm. Save it to a file before you close."; sample → "You are looking at the sample farm." with "Clear sample"; nudge → "Last saved N days ago." with "Save now".
- FarmFileCard: "Save my farm" (downloads via `exportFarm`), "Open a farm file" (file input, then a confirm showing the summary "212 trees, 48 photos, saved 3 November. This replaces the farm on this phone."), "Install app" when `canPromptInstall()`, last-saved line.

- [ ] **Step 1: Write the failing tests:** `isIos` true for an iPhone user agent and for iPadOS desktop mode, false for Android; `shouldNudge` at 6 and 8 days, with sample, with no trees; Welcome shows the install card first on iPhone and not on Android; Welcome "Look around the sample farm" calls `loadSampleFarm` and goes to `/home`; "Start my farm" while the sample is loaded calls `clearFarm` first; FarmFileCard opening a file shows the summary and calls `apply` only after confirm.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the full suite, `npx tsc --noEmit`, `npm run build`. Expected: PASS.
- [ ] **Step 5: Manual check** in the browser at phone size: welcome, sample, banners, save a file, clear site data, open the file.
- [ ] **Step 6: Commit** `feat(frontend): welcome, install and save screens for the phone version`. Ledger: "Step 2 boundary".

### Task 8: Photos on the phone (Step 3 boundary)

**Files:**
- Create: `frontend/src/core/data/local/photos.ts`
- Modify: `frontend/src/core/data/local/farmFile.ts` (photos in and out of the zip), `frontend/src/modules/arbor/api/trees.ts` (local `getPhotos`, `uploadPhoto`)
- Test: `frontend/src/core/data/local/photos.test.ts`

**Interfaces:**
- `shrinkImage(file: Blob, maxSide = 1600, quality = 0.85): Promise<Blob>` (createImageBitmap + canvas; returns the original when it is already within bounds and JPEG); injectable for tests via `setImageShrinker(fn)`.
- Local `uploadPhoto(code, file, type, caption?)` stores `{ id, uid, tree_code, photo_type, caption, taken_at, blob, uploaded_by: 1 }`, logs `photo_uploaded`, returns the row with `photo_url`; `getPhotos(code)` returns rows newest first with `photo_url` = an object URL (cached per id) and `users:{name}`.

- [ ] **Step 1: Write the failing tests:** upload stores the shrunk blob (fake shrinker) and returns `photo_url`; `getPhotos` newest first; a `QuotaExceededError` from the store rejects with "Phone storage is full. Save your farm to a file, then remove some photos." and leaves no photo row and no activity row; the farm file round-trip from Task 5 now includes real photo bytes.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the full suite. Expected: PASS.
- [ ] **Step 5: Commit** `feat(frontend): photos on the phone`. Ledger: "Step 3 boundary".

### Task 9: Name, icons and the GitHub Pages build

**Files:**
- Create: `frontend/scripts/make-icons.mjs` (writes PNGs with Node's `zlib`, no dependencies), `frontend/public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `frontend/public/icons/icon.svg`, `.github/workflows/pages.yml`
- Modify: `frontend/vite.config.ts` (manifest `name`/`short_name` "Arbor", `start_url: './'`, `scope: './'`, relative icon paths, a separate maskable icon, `navigateFallback: 'index.html'`), `frontend/index.html` (title "Arbor", icon `/icons/icon.svg`, theme colour `#2A5934`), `frontend/src/App.tsx` (`<BrowserRouter basename={import.meta.env.BASE_URL}>`), `frontend/src/core/api/client.ts` (redirect to `${import.meta.env.BASE_URL}login`), `frontend/src/core/pages/Login.tsx` (no "TMS")
- Test: `frontend/src/core/data/pwa.test.ts` (reads the built config: manifest name "Arbor", relative `start_url`, three icons, maskable present)

**Interfaces:**
- Pages workflow (modelled on Kannada Kali's): on push to `main` and manual run; permissions `contents: read`, `pages: write`, `id-token: write`; Node 26; in `frontend/`: `npm ci`, `npx vitest run`, `npx vite build --base=/wildarc-arbor/`, `cp dist/index.html dist/404.html`; `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` with `path: frontend/dist`, `actions/deploy-pages@v4`.

- [ ] **Step 1: Write the failing test** (`pwa.test.ts`).
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement**; run `node scripts/make-icons.mjs`.
- [ ] **Step 4: Run** the suite; then `npx vite build --base=/wildarc-arbor/` and check `dist/manifest.webmanifest`, `dist/sw.js` and that `index.html` links resolve under `/wildarc-arbor/`; serve it with `npx vite preview --base=/wildarc-arbor/` and load `http://localhost:4173/wildarc-arbor/trees` directly. Expected: the app opens; Chrome's application panel shows the manifest with no errors and the service worker active.
- [ ] **Step 5: Commit** `feat(frontend): Arbor name, icons and a GitHub Pages build`.

### Task 10: README, screenshots and contributing (Step 4 boundary)

**Files:**
- Create: `docs/screenshots/{welcome,home,trees,tree,map}.png` (390 by 844, sample farm)
- Modify: `README.md` (lead: what Arbor is, Try it link, screenshots, Install on your phone; then Run it locally, phone version and server version; Contributing; Licence; remove the old feature list claims that are not true), `CONTRIBUTING.md` (phone version is the default dev path; `npm run dev:server` for the API), `CLAUDE.md` (data modes, where local data lives), `docs/STATUS.md` (branch row, server bugs found for step 6: tree status and `custom_common_name` dropped by the update schema, health fields dropped, `validate.ts` crashes on zod 4 errors, photos read the wrong field names before this branch)

- [ ] **Step 1:** Run the Pages build with `vite preview`, load the sample farm, take the five screenshots at 390 by 844.
- [ ] **Step 2:** Write the README and the doc changes. Every command in the README is one that was run in this task.
- [ ] **Step 3:** Fresh-clone check: `git clone` the local repo into the scratchpad, `cd frontend && npm ci && npm run dev`, open the app. Expected: works with no other step.
- [ ] **Step 4: Commit** `docs: README with screenshots, try-it link and local setup`. Ledger: "Step 4 boundary".

### Task 11: The server version on Supabase (Step 5 boundary)

**Files:**
- Create: `supabase/migrations/0001_baseline.sql`, `supabase/seed.sql`, `scripts/make-seed.mjs` (reads `frontend/src/core/data/local/sample-farm.json`, writes `supabase/seed.sql`, hashes the local owner password with `bcryptjs`)
- Modify: `.env.example` (comments for a Supabase project and for the Supabase command line), `README.md` (server version section with the two warnings from design 4.9), `docs/STATUS.md`
- Test: `scripts/baseline.test.mjs` or a Vitest file under `src/` that loads the baseline and the seed into PGlite (`@electric-sql/pglite`, dev dependency at the repository root) and runs the queries the routes run

**Interfaces:**
- Tables: `users` (`id bigint identity, name, email unique, password_hash, role, phone, bio, profile_photo, is_active, created_at`), `land_zones`, `species`, `ecosystem_roles`, `trees` (all columns Appendix A and the routes use), `tree_activity_log`, `tree_health_observations`, `tree_photos`, `tree_contributors`, `projects`, `project_members` (from migration 002); views `zone_summary` (as migration 008) and `map_tree_view` (Appendix A map shape). Columns come from the route files and `docs/migrations/*.sql`; where they disagree, the routes win.
- Seed owner: `owner@example.com`, password `arbor-local-only`, written in `.env.example` and README as local-only.

- [ ] **Step 1: Write the failing test:** baseline and seed load into PGlite without error; `select * from zone_summary` returns 5 rows; `select * from map_tree_view` returns 40 rows with `display_name` set; the owner's `password_hash` verifies with `bcryptjs.compare('arbor-local-only', hash)`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** the baseline, the seed script and the docs.
- [ ] **Step 4: Run** the test and both suites. Expected: PASS. Note in the README that the Supabase command-line route was not run here (no Docker on the build machine).
- [ ] **Step 5: Commit** `feat: Supabase baseline and seed for the server version`. Ledger: "Step 5 boundary".

---

## Appendix A: shapes the local functions return

Same as the server today (read from `src/modules/*/routes/*.ts`). Numbers are numbers; dates are ISO strings.

- `getTrees(params)` → `{ trees: TreeRow[], total, page }`; `TreeRow = { id, tree_code, custom_common_name, health_score, action, status, priority, coord_x, coord_y, updated_at, species: {common_name, scientific_name, ecosystem_roles} | null, land_zones: {zone_code, zone_name} | null, assigned_user: {name} | null }`. Params: `zone` (zone id, may be a string), `action`, `status`, `priority`, `assigned_to`, `search` (on `tree_code`, case-insensitive), `page` (1), `limit` (50).
- `getTree(code)` → the stored tree plus `species` (full row), `land_zones` (full row), `assigned_user: {id, name, email} | null`, `added_user: {name}`, `tree_contributors: []`.
- `createTree` → 201-equivalent: the stored tree. `updateTree` → the stored tree. `deleteTree` → `{ success: true }` (also deletes the tree's health, activity and photos).
- `getActivity` → rows `{ id, tree_code, action_taken, previous_status, new_status, notes, logged_at, users: {name, role} }`, newest first, at most 100. `addActivity` → the row without `users`.
- `getHealth` → rows `{ id, tree_code, observed_at, health_score, leaf_color, bark_condition, pest_presence, disease_signs, height_m, additional_notes, notes, observed_issues, users: {name} }`, newest first. `addHealth` → the row.
- `getPhotos` → rows `{ id, tree_code, photo_url, photo_type, caption, taken_at, users: {name} }`, newest first.
- `getSpecies` → species rows sorted by `common_name`: `{ id, common_name, scientific_name, description, fun_fact }`. `createSpecies` keeps those four fields.
- `getZones` → `{ id, zone_code, zone_name, project_id: null, total_trees, completed }`. `getMapZones` → `{ id, zone_code, zone_name, description, boundary_coords, project_id: null }`. `createZone` keeps `zone_code` (upper case), `zone_name`, `description`, `boundary_coords`.
- `getMapTrees` → `{ id, tree_code, action, coord_x, coord_y, display_name, zone_code, health_score, height_m, status }`.
- `getDashboardStats` → `{ stats: { total, pending, inProgress, completed, toCut, toTrim, urgent }, zones: getZones() }`.
- `getPublicTree(code)` → `{ code, name, species, description, funFact, publicNotes, age, height, status, zone, ecosystemRoles: [], edibleParts: null, referenceImages: [], contributors: [], plantingDate }`.
- Errors: `LocalDataError` with `response.status` and `response.data.error`.
