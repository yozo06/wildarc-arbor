# Arbor: status

**Updated:** 2026-11-12

The [roadmap](superpowers/specs/2026-11-12-arbor-roadmap-design.md) is the plan. This page is the short
"where are we" note: what each branch holds, what was measured, and what it waits on. Update it whenever a
branch merges or a decision lands.

## Direction set by the owner on 2026-11-12

This comes before the roadmap's Stage 0. The aim for the next version of Arbor:

- **Now:** anyone can install Arbor on a phone and use it with no account and no server. Their data stays
  in the phone's own storage.
- **Later:** an option to connect a database, so a farm's data can be backed up and shared between phones
  and people.
- **Maybe later:** a few paid features.

It is no longer phone-only: from 1024px wide the same app has a desktop layout, with a sidebar and wider
pages. The data still stays on the device.

The approved roadmap starts from the opposite place: one hosted server and one shared database, with
sign-in and roles (Stages 0 to 2, decisions D7 and D8). So the first piece of work in this repository is a
re-plan, not code. Design the on-device version with the owner, then update the roadmap and this page in
the same pull request. The re-plan is the
[phone-first design](superpowers/specs/2026-11-12-arbor-phone-first-design.md), approved by the owner on
2026-11-13 with its defaults (section 10 there): the owner's own farm stays on the live server for now,
supporters and grants come first for money, and a contributor licence agreement is needed before the first
outside pull request. It is being built on `feature/arbor-phone-first`. The questions it answers:

1. **The server that is live today, and the farm data already in it.** Keep it running, move its data into
   the phone app, or retire it. While it runs, its loose access rules (roadmap section 2.3) still need
   fixing.
2. **Keeping data safe on a phone.** Browsers can clear a site's storage. Safari on iPhone deletes it after
   about a week without a visit unless the app was added to the home screen. Until a database option
   exists, people need a way to save their data to a file and load it back.
3. **What a person does first on the phone.** Adding a tree, the Land Map and logging health are the
   candidates.
4. **Paid features and the licence.** Arbor is AGPL-3.0. The owner holds the copyright, so selling features
   or offering other terms stays open to them. Once other people's code is merged, changing terms needs
   their agreement too (usually through a contributor licence agreement). Settle this before accepting
   outside contributions.
5. **Where the phone app is served from.** A phone-only app is a set of static files, so any static host
   can serve it.

What carries over unchanged: the one rule (the app records and shows; the libraries calculate), the Land
Map, and the biodiversity library. The library is one function with no dependencies, so it can run on the
phone itself, and the biodiversity server endpoint below may not be needed at all. Decide that in the
re-plan.

## Branches

Every figure below was measured with Node 26 after a clean `npm ci`, the same steps CI runs.

| Branch | What it holds | Checks | Waits on |
|---|---|---|---|
| `main` | The app as split out of `tms`, plus the roadmap, this page, `CLAUDE.md` and the GitHub templates. | Backend: type check clean; tests **8 pass, 1 fails** (the schema test the CI repair fixes). Frontend: type check clean, 12 of 12 tests, build succeeds. | Nothing. |
| `fix/ci-schema-test-and-cookie-ignore` | Repairs the failing schema test. Fixes the ignore rule for the browser-profile folder, which does not work on `main` because of a comment on the same line. | Backend: 9 of 9. | Nothing. **Merge first**, so everything else lands on a green `main`. |
| `feature/arbor-land-map` | The zoomable Land Map, the screen edits carried over from May, and the map's design note. | Frontend: type check clean, 39 of 39 tests, build succeeds. One React `act(...)` warning from the tree list tests, not a failure. Backend not touched. | A review, and a run against real farm data (it has only seen sample data). |
| `draft/biodiversity-endpoint` | `GET /api/dashboard/biodiversity`: richness, Shannon, Simpson and evenness for the standing trees, computed by `@wildarc/diversity`. Stacked on the CI repair branch. | Backend: 15 of 15. | See below. Not ready to publish or merge. |
| `feature/arbor-phone-first` | The phone version, built on top of the Land Map: data on the phone, the farm file, the sample farm, welcome and install screens, photos, the Arbor name and icons, the GitHub Pages build, README screenshots. Also the server version's database rebuilt as one Supabase migration with a seed, row-level security on every table. Built by its plan; the [build record](superpowers/plans/2026-11-13-arbor-phone-first-record.md) says where to cut it into one pull request per step. | Frontend: type check clean, 150 tests, both builds succeed. Reviewed by a fresh reviewer; its four fixes are in. Checked in Chrome at phone size, including real IndexedDB, real photo shrinking and the service worker under `/wildarc-arbor/`. Backend: 16 pass, 1 fails (the schema test the CI repair fixes); the baseline and seed load into an in-memory Postgres. | Publishing, then checks on a real Android phone and a real iPhone (the iPhone share sheet for saving, Safari's storage rules). |

### What the biodiversity branch waits on

1. The library `wildarc-diversity` being public with a `v0.1.0` tag.
2. Its dependency line being re-pointed from a local path to that tag, with the lockfile regenerated.
3. A rename to `feature/arbor-biodiversity-endpoint`, to match `CONTRIBUTING.md`.
4. The Stage 0 access work. The endpoint answers any signed-in user and is not limited to one farm. That
   matches every other read in the app today, and it is exactly what Stage 0 tightens (roadmap section
   2.3, items 2 and 9). Decide which roles may read farm-wide figures as part of that work, then merge.

The re-plan may drop this branch instead, if the phone computes the figures itself.

## Order of work

1. Merge the CI repair, then the Land Map, then the phone version's pull requests in order.
2. Turn on GitHub Pages and check the phone version on real phones.
3. Step 6 of the phone-first design: the server version's access work (D8), with its own plan. Server bugs
   found while building the phone version, all still in the server version:
   - The tree update rules drop `status`, `custom_common_name` and `log_notes`, so changing a tree's status
     from the tree page fails with "No valid fields to update".
   - The health rules keep only `health_score`, `observed_issues` and `notes`; the form's leaf colour, bark,
     pests, disease, height and notes are thrown away.
   - `src/core/middleware/validate.ts` reads `.errors`, which zod 4 no longer has, so any request that fails a
     check gets no response.
   - `src/scripts/set_owner_pass.ts` gives a fixed account a fixed, published password. Never run it against a
     live database; remove or rewrite it in that work.

## Publishing to GitHub

Neither this repository nor the library was on GitHub when this page was written. The order:

1. Create two empty public repositories under `yozo06`: `wildarc-diversity` and `wildarc-arbor`. Empty
   means no README, licence or `.gitignore` added on GitHub, so the existing history goes up as it is.
2. Library: push `main`, then the tag `v0.1.0`.
3. This repository: push `main`.
4. Open the CI repair branch, then the Land Map branch, as pull requests against `main`.
5. The biodiversity branch only after step 2 and its dependency re-point, if the re-plan keeps it.
6. Hosting stays on the old `tms` repository until the re-plan decides what the live server becomes
   (decision D7).

Settings for this repository once `main` is on GitHub (defaults; the owner can change them):

- Squash merging only, and delete branches after merge. Pull request titles follow Conventional Commits,
  so each squashed commit on `main` does too.
- Protect `main`: require a pull request and the `PR Status` check.
- Create the labels the templates use: `type:bug`, `type:feature`, `type:enhancement`, `type:chore`.
  GitHub silently drops a template's label when the label does not exist.
- Turn on private vulnerability reporting, so security problems arrive privately, not as public issues.
- Wiki off, issues on.

## Node

CI and `.nvmrc` use Node 26, the current long-term version, since 2026-11-12. Node 24 also passes. Node 20
reached its end of life in April 2026 and is no longer used here. The library's CI runs 24 and 26.

## Open with the owner

- The five questions under "Direction" above.
- **Q1** Is the live Supabase project reachable, so the database can be dumped?
- **Q2** Is there a real tree inventory to load?
- **Q3** Which phones do the people using Arbor carry?
- **Q4** What permanent web address will the tree tags point to?
- May the farm's name appear in this repository? It is left out for now.
