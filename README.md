# Arbor

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

Arbor keeps track of every tree on a farm or food forest: where it stands, what it is, how healthy it is and
the work it needs. It runs on a phone, from a link, with no account. The farm stays on the phone, and can be
saved to a file at any time.

**Try it:** open <https://yozo06.github.io/wildarc-arbor/> on a phone and tap **Look around the sample farm**.

<table>
  <tr>
    <td><img src="docs/screenshots/home.png" width="200" alt="Home: tree counts, progress and urgent trees for the sample farm"></td>
    <td><img src="docs/screenshots/trees.png" width="200" alt="The tree list with species, health and the work each tree needs"></td>
    <td><img src="docs/screenshots/tree.png" width="200" alt="One tree: health score, age, height and status"></td>
    <td><img src="docs/screenshots/map.png" width="200" alt="The Land Map: every tree plotted in its zone, coloured by the work it needs"></td>
  </tr>
</table>

The screenshots show "Sample Food Forest", a made-up farm that ships with the app.

## Install it on your phone

- **Android (Chrome):** open the link and tap **Install app** (or the ⋮ menu, then **Install app**).
- **iPhone (Safari):** open the link, tap **Share**, then **Add to Home Screen**, and open Arbor from the Home
  Screen. Do this before you add any trees: Safari and the Home Screen app keep separate data.

## Your data

- It stays on the phone, in the browser's storage. There is no account and nothing is sent anywhere.
- **Save my farm** (on the Me page) writes one file, `arbor-farm-<date>.zip`, with every tree, entry and photo.
  Keep it somewhere safe. Arbor reminds you if a week passes without a save.
- **Open a farm file** replaces the farm on the phone with the one in the file. It is also how you move a farm
  to a new phone.
- Clearing the browser's data for the site deletes the farm on that phone. The file is your backup.

## Run it on your computer

The phone version needs nothing but Node 26 (`nvm use` reads `.nvmrc`):

```bash
cd frontend
npm ci
npm run dev
```

Open the address Vite prints. Tests and type checks, also in `frontend/`:

```bash
npx vitest run
npx tsc --noEmit
```

## Server version

The same screens can also run against an Express API and a Supabase database, with sign-in and roles: that is
how Arbor started, and how one farm still uses it. In `frontend/`, `npm run dev:server` and
`npm run build:server` build it; the API lives in `src/`. The database schema is being rebuilt into this
repository; [docs/STATUS.md](docs/STATUS.md) says where that stands.

## How it is built

- `frontend/`: React, Vite, Tailwind and Zustand, installable as a web app. The build setting `VITE_DATA_MODE`
  picks where data lives: on the phone (the default) or on the server.
- On the phone, data lives in IndexedDB; the farm file is a zip of `farm.json` and the photos.
- `src/`: the Express and TypeScript API on Supabase, for the server version only.
- Figures with a formula behind them come from separate, MIT-licensed libraries that cite their sources, such
  as [`@wildarc/diversity`](https://github.com/yozo06/wildarc-diversity). The app records and shows; the
  libraries calculate.
- Every push to `main` publishes the phone version to GitHub Pages (`.github/workflows/pages.yml`).

Arbor is part of WildArc, an open-source effort to help farms keep track of their land. It was split out of
[yozo06/tms](https://github.com/yozo06/tms) in November 2026 and keeps that repository's history.

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md). [docs/STATUS.md](docs/STATUS.md) says where things stand, and the
plans are in [docs/superpowers/specs/](docs/superpowers/specs/).

## Licence

[AGPL-3.0](LICENSE).
