# Arbor: where it stands and where it goes

**Date:** 2026-11-12
**Status:** approved by Yogesh on 2026-11-12, with every decision in section 7 at its default. Later the
same day the owner set a new direction: a phone-only app first, a database option later. `docs/STATUS.md`
records it, and the [phone-first design](2026-11-12-arbor-phone-first-design.md) re-plans Stages 0 to 2
around it, including how Arbor could make money. Questions Q1 to Q4 are still
open. Nothing in section 3 is built yet; `docs/STATUS.md` says what has moved since.
**Scope:** the arbor app only (repository `wildarc-arbor`). Flora, terra, synapse and bloom get their own
plans afterwards, outside this repository.
**Screens:** the mock-ups for stages 1 to 4 are on a design canvas, "WildArc Arbor: next screens", kept
privately by the owner for now. Six phone screens with sample data, marked as such. The bottom bar on them
shows the end state: the Harvest tab arrives with Stage 4.

Lines marked **(my call)** are decisions Claude made. Lines marked **(guess)** are things Claude assumed
about what Yogesh wants. Everything else is either a fact read from the code or something Yogesh said.

---

## 1. What arbor is for

**(guess)** Arbor is the field tool for one real farm. Every tree gets a code, a place on the map, a health
history and a job to be done. The owner sees the whole farm at a glance; a worker with a phone sees the
trees assigned to them and logs what they did.

**(guess)** Arbor is also the first real user of the WildArc Kit libraries. On 2026-11-09 the end-to-end
app was paused because it had no field use case, and the work moved to small, source-cited ecology
libraries. On 2026-11-10 Yogesh designed a Land Map for a real farm in a separate chat, and on 2026-11-12
asked for arbor to be planned again. This plan reads that as: the farm is the field use case, and arbor is
where each library proves itself on real trees.

That gives one rule for the whole roadmap: **the app records and shows; the libraries calculate.** A figure
such as a diversity index or a carbon estimate is computed by a library that cites its source, never by
code written inside the app.

## 2. Where arbor is today

### 2.1 What works

| Area | What exists on `main` |
|---|---|
| Trees | Add, edit, delete, list, detail page. Each tree has a code, species, zone, action (pending, cut, trim, keep, monitor, treat, replant), priority, assignee, health score 1 to 10, age, height, trunk diameter, X/Y position in metres, notes, planting date. |
| History | Health observations over time (score, issues, notes). Activity log (what was done, notes). Photos, stored in Google Drive. Contributors per tree. |
| Farm | Zones. Species list with ecological roles. A simple X/Y map (owner only). A public page per tree at `/tree/:code`. |
| People | Sign-up, login, three roles (owner, employee, volunteer). Owner manages employees. A worker's home screen lists the trees assigned to them. |
| Dashboard | Counts: total, pending, in progress, completed, to cut, to trim, urgent, and a per-zone summary. |
| Platform | Installable on a phone (PWA). Backend: Express + TypeScript on Supabase. Frontend: React, Vite, Tailwind, Zustand. |

Screens today: login, sign-up, home (dashboard or field list by role), tree list, add tree, tree detail,
edit tree, log health, log activity, map, employees, profile, public tree page.

### 2.2 What is ready but not merged

- **CI repair** (branch `fix/ci-schema-test-and-cookie-ignore`, backend tests 9 of 9 green).
- **Biodiversity endpoint** (branch `draft/biodiversity-endpoint`, backend tests 15 of 15 green). Returns
  species richness, Shannon, Simpson and evenness for the farm, computed by `@wildarc/diversity`. It has no
  screen yet. It depends on the library by a local path until the library has a public tag, so it cannot
  be merged before then.
- **The Land Map** (branch `feature/arbor-land-map`, frontend tests 39 of 39 green), written in Yogesh's
  design chat: zoom, pan, colour by action, health, zone or species, and a small card for the selected
  tree. The zone jumps and the larger tree drawer are designed but not built. It has only been run on
  sample data. `docs/designs/land-map/README.md` on that branch has the details.
- **18 older agent branches** in the owner's copy of the old `tms` repository, not published (QR codes,
  photo timeline, CSV export, carbon profile, species metadata, security fixes, more tests, API docs, seed
  data). They were written unattended before the split and were never reviewed or merged.

### 2.3 What is missing or fragile

1. **The database cannot be rebuilt from the repository.** The eight base tables (users, trees, species,
   zones, activity log, health observations, photos, contributors) were created by hand in Supabase
   Studio. The first migration file is only a comment promising a dump "later". The code also reads two
   objects that no file creates: the view `map_tree_view` (behind the map) and the table `ecosystem_roles`
   (behind the species list). The view `zone_summary` (behind the dashboard and zones) is created only by
   migration 008, which assumes an earlier hand-made version. Migrations 004, 006 and 007 are missing from
   the sequence. So only the live Supabase project describes the database the code runs against. If that
   project is lost, the structure is lost with it.
2. **Multi-farm is half done.** The database has `projects` and `project_members` tables; the backend
   ignores them (one line mentions `project_id`). Today the app is a single-farm app with unused tables.
3. **No offline writes.** The app installs on a phone and caches pages, but a log made without signal is
   lost.
4. **Growth is overwritten.** Height and trunk diameter are single fields on the tree. A new measurement
   erases the old one, so there is no growth history, and biomass over time cannot be computed.
5. **Positions are X/Y metres typed by hand.** No GPS capture.
6. **Thin tests.** Two backend test files and three frontend test files on `main`, and two of those three
   sit in the legacy folders that item 7 removes.
7. **Leftovers.** A duplicate legacy `frontend/src/pages/` folder. An emoji used as an icon on the
   worker's home screen.
8. **Not on GitHub when this was written.** The arbor repository and the library repository were both
   local only.
9. **Access rules are too loose.** Sign-up is not limited to people the owner invites, and signed-in roles
   can see and change more than they should. Decision D8 sets the target, and it is fixed first in
   Stage 0.
10. **Lists stop silently at 1000.** The map and the dashboard read trees without paging, and Supabase
    returns at most 1000 rows per request. Above 1000 trees the map and the counts would be short with no
    error shown. The biodiversity endpoint checks for this and returns an error instead.

Absent altogether: QR tags, GPS, offline queue, CSV import and export, harvest and yield, growth over time,
farm picker, any biomass or carbon figure, any biodiversity figure on screen.

## 3. Where it goes

Six stages. Each ends with something a person on the farm can use, and each has an exit test. Stages 1 to 4
have screens on the design canvas.

### Stage 0: a clean base

Nothing new for the user. Everything after depends on it.

- **First: confirm the live Supabase project is reachable and take a full dump of its structure** (question
  Q1). The rest of this stage rests on that dump. If the project is gone or cannot be reached, the fallback
  is to rebuild the structure from what the code reads. That is a different and riskier plan, and this
  stage is re-planned before anything else is done.
- Merge the CI repair.
- Turn the dump into a real first migration: the eight base tables, the views and the roles table the code
  reads. Prove a fresh database can be built from the repository alone.
- Close the open door (decision D8): sign-up by invite, contact details for the owner only, volunteers log
  but do not edit tree records. Each rule gets a test.
- Remove the legacy duplicate pages folder.
- Read the two security branches and the rate-limiting branch from the old repository, list what each one
  actually fixes, and bring the real fixes over with tests.
- Put the two repositories on GitHub and give the library its first public tag (decision D3), then point
  the hosting at the arbor repository (decision D7).

**Exit test (my call):** the CI steps pass on arbor `main`; until the repository is on GitHub, a local run
of the same steps under Node 20 counts. The migrations apply cleanly to an empty Postgres database (one can
be run in a local container) and the resulting structure matches the dump of the live one. A sign-up
without an invite is refused. Tests that need a running database are not required in this stage.

### Stage 1: see the farm

- Bring the Land Map and the brand colours into the arbor repository (needs decision D2).
- Phone layout for the map: tap a tree, a drawer slides up with its health, action and size, and one button
  to log health.
- Dashboard gets a biodiversity card: species count, Shannon, Simpson, evenness, and the top species by
  share, from the endpoint that already exists (needs decision D4). The card can be built and tested
  locally, but it cannot merge to `main` until `@wildarc/diversity` has a public tag (decision D3).
- If the farm has more than 1000 trees (question Q2), the map and dashboard read trees in pages in this
  stage, so nothing is cut off silently.

**Exit test:** on a phone, the owner sees every tree in the right place, can colour the map by species,
health or action, and the dashboard shows four diversity figures with their source named. "On a phone"
needs the hosting pointed at the arbor repository (decision D7); until then it is checked in a phone-sized
browser window.

### Stage 2: work in the field

- **QR tags.** A print sheet of tags, one per tree. Scanning a tag with any phone camera opens that tree.
  A tag carries a web address, so the address must be one Yogesh controls and will keep (question Q4): a
  tag printed with a temporary address is wasted. **(my call)** On an iPhone, a tag scanned with the camera
  opens in the browser, not in the installed app, and the two do not share the login or the waiting logs.
  So if any worker carries an iPhone (question Q3), this stage also includes a scanner inside the app.
- **Fast logging.** Health and activity logging rebuilt for one thumb: big score buttons, issue chips,
  optional photo, one save button.
- **Offline queue.** A log made without signal is kept on the phone and sent when signal returns. The
  worker sees "saved on this phone, waiting to send" and a count of waiting logs. Each log carries an id
  made on the phone so that a retry can never create a duplicate.
- **GPS capture.** "Use my location" when adding or moving a tree. See section 4.2 for how GPS and the
  X/Y map fit together.
- **Photo timeline** on the tree page.

**Exit test:** with the phone in flight mode, a worker scans a tag, logs health with a photo and closes the
app; when signal returns, the log and photo appear on the tree once, not twice.

### Stage 3: measure what the farm holds

- **Measurements over time.** Height and trunk diameter are recorded per visit instead of overwritten. The
  tree page shows a growth chart.
- **`@wildarc/biomass`**, the second Kit library, in its own repository. Above-ground biomass from trunk
  diameter, height and wood density; carbon from biomass; CO2 equivalent from carbon. Every equation and
  default value cites its published source, as `@wildarc/diversity` does. See section 4.4.
- Tree page and dashboard show biomass and carbon, with the source and the measurement date beside them.
  **(my call)** The farm figure also says how many trees it covers, because palms, saplings and species
  without a wood density are left out. If most of the farm is palm, coffee or banana (question Q2), the
  figure covers a minority of it and the screen must say so.
- **CSV export and import** of trees and logs.

**Exit test:** the dashboard shows a farm-level carbon figure where every input can be traced to a
measurement and every formula to a citation; a tree with three measurements shows a three-point growth
chart.

### Stage 4: harvest and yield

- Harvest log: date, tree or zone, product, quantity in kg, grade (A+, A, B, C, reject), value.
- Yield view: total harvest, value, and trees that produced, for a chosen period; filter by product and
  zone; "Log harvest" as the main button.

**Exit test:** the owner can answer "how much jackfruit did zone B give this season, and which trees gave
none" from the app.

### Stage 5: more than one farm

- Finish multi-farm: every backend query scoped to a farm, a farm picker, existing data assigned to the
  first farm.
- Species data as a library (`species`), seed data, API documentation.

**Exit test:** two farms in one database, and a user of one cannot see a tree of the other.

**(my call)** Stage 5 waits until a second farm actually exists.

### What gets reused from the old agent branches

**(my call)** The old branches are read as reference and re-implemented test-first in the arbor
repository. They are not merged wholesale: nobody reviewed them, and they were written against a
repository layout that no longer exists.

| Stage | Old branches worth reading |
|---|---|
| 0 | `T-01-H-21-H-22-test-fixes`, `H-09-arbor-api-tests`, `H-09a-trees-route-tests`, `H-10-ui-component-tests`, `C03-C04-security-batch`, `C05-H15-H11-batch`, `H06-C03-build-fix-rate-limiting` |
| 1 | `H-20-map-color-imports`, `H-23-focus-rings`, `H-23b` |
| 2 | `M-03-qr-codes`, `M-04-photo-timeline` |
| 3 | `M-05-M-06-data-insights` (CSV export), `M-07-carbon-profile` |
| 5 | `M-11-species-metadata`, `H-12-seed-data`, `H-13-openapi-spec`, `H-13b-swagger-jsdoc` |

## 4. Design choices that shape more than one stage

### 4.1 Phone first

Every new screen is designed at phone width (390) first. Buttons and tap targets are at least 44 px tall.
Icons are drawn, not emoji. Colours that carry meaning (health bands, actions) also differ in lightness or
carry a label, so they survive bright sun and colour blindness. The look is the one Yogesh's Land Map
already uses: forest green `#2A5934`, off-white ground `#F7F5EE`, gold `#D8A419`, Nunito for text and
Playfair Display for headings.

### 4.2 GPS and the X/Y map **(my call)**

The map keeps working in farm-local metres (X east, Y north from a fixed corner of the farm). That is what
the Land Map draws and what every existing tree already has.

- The farm gets one **origin**: the latitude and longitude of the map's (0, 0) corner.
- A tree gains optional latitude, longitude and accuracy. When a worker taps "Use my location", the phone's
  position is stored and converted to X/Y metres from the origin.
- A phone under tree canopy is typically accurate to 5 to 15 metres, which is more than the spacing between
  trees. So GPS gives the first placement only; the person then drags the dot on the map to the right spot.
  The dragged X/Y is the truth; the raw GPS reading is kept beside it as a record.
- A satellite or street basemap is not part of this roadmap. The farm plan drawn in metres is enough to
  find a tree.

### 4.3 Offline writes **(my call)**

- Only logs are queued offline in Stage 2: health, activity, measurement and their photos. Creating or
  editing trees, zones and species needs signal.
- Each queued log gets an id on the phone. The server refuses a second log with the same id, so a retry
  after a dropped connection is safe.
- The queue lives in the browser's own storage on the phone. Clearing browser data loses unsent logs, and
  the screen says so where the count of waiting logs is shown.
- If two people log the same tree offline, both logs are kept. Logs only ever add; nothing is overwritten.

### 4.4 Biomass and carbon **(my call)**

`@wildarc/biomass` follows the pattern of `@wildarc/diversity`: pure functions, no database, every formula
cited, `null` instead of a guess when an input is missing.

- Above-ground biomass: the pantropical equation of Chave et al. (2014), from trunk diameter, height and
  wood density.
- Wood density per species: from the Global Wood Density Database (Zanne et al. 2009), stored with the
  species, with its source. A species without a density gives `null`, not a default.
- Carbon: biomass times the IPCC (2006) default carbon fraction of 0.47.
- CO2 equivalent: carbon times 44/12.
- The equation is fitted for trees. Palms (areca) and very small saplings are outside its range; the
  library returns `null` for them until a cited palm equation is added.
- The library's own design gets a short document of its own before it is built, with the citations checked
  against the papers.

### 4.5 New data

New tables and columns the stages add. Names are suggestions; the builder may adjust them.

| Stage | Addition |
|---|---|
| 0 | First migration that creates the eight base tables as they exist today. |
| 2 | An id made on the phone (`client_id`, unique) on health observations and activity logs. Farm origin (latitude, longitude). Latitude, longitude and accuracy on trees. |
| 3 | `tree_measurements`: tree, date, height, trunk diameter, who measured, `client_id`. The tree's own height and diameter fields keep showing the latest measurement. Wood density and its source on species. |
| 4 | `harvests`: tree or zone, date, product, quantity in kg, grade, value, who logged. |
| 5 | A farm id on every table that lacks one, filled in for existing rows. |

### 4.6 Photos **(my call)**

Photos stay in Google Drive, as today. If uploads from the field prove unreliable in Stage 2, moving them
is a separate decision.

## 5. Goals, non-goals, anti-goals

**Goals**

- One farm uses arbor in the field, on phones, including where there is no signal.
- Every ecology figure on screen comes from a Kit library and names its source.
- The repository alone is enough to rebuild the system.
- Each stage ships something usable on its own.

**Non-goals** (not in this roadmap)

- A native mobile app. The installable web app is enough.
- Satellite or GIS basemaps.
- Notifications, advanced filters, a tree age calculator.
- Anything belonging to flora, terra, synapse or bloom.
- Selling, pricing or market features beyond a value typed on a harvest.

**Anti-goals** (would make it a failure even if it works)

- A number on screen that cannot be traced to a measurement and a cited formula.
- A worker's log lost or duplicated.
- A feature that only works with signal, in a tool meant for the field.
- Ecology maths written inside the app instead of a library.
- Building for many farms before one farm uses it daily.

## 6. Constraints

- **Tests run under Node 20**, the version CI pins. Node 26 breaks 8 frontend tests.
- **Stack stays.** Express, TypeScript, Supabase, React, Vite, Tailwind, Zustand. No new framework.
- **Test-first.** Every behaviour change starts with a failing test.
- **Licences.** Arbor is AGPL-3.0; the libraries are MIT.
- **Libraries are consumed by git URL pinned to a tag**, so the library repository must be public before
  arbor's CI or host can install it.

## 7. Decisions for Yogesh

**Settled on 2026-11-12:** Yogesh approved the roadmap and chose the default for every decision below
(D1 to D8). The "Default" column is now the decision. Approving D3 and D7 settles what will be done; the
pushes and the hosting change themselves are still made by Yogesh, or with their go-ahead at the time.

Each has a default. If Yogesh says nothing on one, the default stands.

| # | Decision | Default |
|---|---|---|
| D1 | Is the farm the field use case, with Yogesh as owner and workers on phones? | Yes. The whole roadmap assumes it. |
| D2 | Bring the Land Map and brand colours from the old `tms` folder into the arbor repository as the first feature, and point the design chat at the arbor folder from now on? | Yes. |
| D3 | Create `yozo06/wildarc-diversity` (public) and `yozo06/wildarc-arbor` on GitHub, and when does the library get its first public tag? | Create both; arbor public like the library; the owner makes the pushes; tag the library `v0.1.0` during Stage 0, because Stage 1's biodiversity card cannot merge without it. |
| D4 | Biodiversity rules: a tree stops counting only when it is marked cut and completed; every signed-in user of the farm can see the figures; above 1000 trees the endpoint returns an error for now. | Keep all three as built. |
| D5 | Order after Stage 1. | Field (2), then measure (3), then yield (4). Field first because every later figure depends on logs captured there. |
| D6 | Multi-farm timing. | Stage 5, when a second farm exists. Until then no new code reads the half-built farm tables. |
| D7 | Point the hosting at the arbor repository (it carries Render and Vercel settings; which live services exist is for Yogesh to confirm). | Yes, right after Stage 0. Later exit tests run on a real phone, and the offline queue only works on a secure (https) address. |
| D8 | Who may sign up, and who sees what. | Sign-up by invite from the owner only. Names, emails and phones visible to the owner only. Volunteers can add logs but cannot edit or delete tree records. Fixed in Stage 0. |

### Questions only Yogesh can answer

These came out of a reviewer's read of this plan. Each answer changes what gets built. Most important
first.

| # | Question | What the answer changes |
|---|---|---|
| Q1 | Is the live Supabase project still there, and can Yogesh reach it? | Stage 0 starts with a dump of it. Without it, Stage 0 becomes a rebuild of the structure from the code: a different, riskier plan. |
| Q2 | The farm's real trees: roughly how many, what kinds, and are they already in the app with positions? | If they are not entered, CSV import moves ahead of Stage 1. Above 1000 trees, paging is needed in Stage 1 and the biodiversity rule in D4 changes. If most are palm, coffee or banana, Stage 3's carbon figure covers a minority of the farm. |
| Q3 | Which phones do the workers carry: Android, iPhone, or both? | Any iPhone adds an in-app scanner to Stage 2. |
| Q4 | Which permanent web address goes on the printed tags? | Tags cannot be printed until it is fixed. |

Parked, outside this roadmap: the five stale pull requests on the old `tms` repository, removing arbor code
from `tms`, and where the Kit's own design documents live.

## 8. Calls Claude made

To check while reading:

1. The framing in section 1 (farm tool plus proving ground for the libraries).
2. Six stages in this order, and Stage 5 waiting for a second farm.
3. Old agent branches are reference only, re-implemented test-first.
4. GPS gives a first placement; the dragged X/Y position is the truth (4.2).
5. Only logs are queued offline; tree edits need signal (4.3).
6. The biomass method and its sources, and `null` for palms and saplings (4.4).
7. Photos stay in Google Drive (4.6).
8. No satellite basemap, notifications or native app in this roadmap.
9. Arbor's GitHub repository defaults to public.
10. Stage 0's exit test: a local run counts until GitHub exists, the rebuilt structure must match the live
    dump, and tests that need a running database wait.
11. The default for D8 (invite-only sign-up, owner-only contact details, volunteers log but do not edit),
    fixed in Stage 0 instead of later.
12. A scanner inside the app in Stage 2 if any worker carries an iPhone.
13. The farm carbon figure says how many trees it covers.

## 9. Left to the builder

- Component and file structure inside the existing `modules/arbor` layout.
- Which small libraries to use for QR generation, phone-side storage and charts, or whether to draw charts
  as plain SVG.
- Exact table, column and endpoint names beyond those suggested here.
- How the tag print sheet is laid out on paper.
- Test structure, as long as each behaviour has a test that failed first.

## 10. How this plan is used

- This document is the roadmap. Once approved, each stage gets its own step-by-step implementation plan,
  written when that stage starts, not before.
- Implementation happens in this repository, starting with Stage 0 and Stage 1. Each stage's plan goes in
  `docs/superpowers/plans/`.
- The other components (flora, terra, synapse, bloom) are planned separately, outside this repository.
- This copy is the maintained one. `docs/STATUS.md` records what has changed since the date above.
