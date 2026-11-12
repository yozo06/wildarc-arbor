# Phone-first Arbor: design

**Date:** 2026-11-12
**Status:** approved by the owner on 2026-11-13, with every default in section 10 accepted. Being built on
branch `feature/arbor-phone-first`; the plan is in `docs/superpowers/plans/2026-11-13-arbor-phone-first.md`.
**Relation to the roadmap:** this is the re-plan that `docs/STATUS.md` asks for. It changes the order of
the [roadmap](2026-11-12-arbor-roadmap-design.md)'s Stages 0 to 2 (section 7 below) and leaves the rest of
the roadmap standing.

Lines marked **(my call)** are decisions Claude made. Lines marked **(guess)** are assumptions about what
the owner wants. Everything else is a fact read from the code or something the owner said.

## 1. Intent

The owner's aim, set on 2026-11-12: anyone can use Arbor on their phone. For now the data stays on the
phone. Later there is an option to connect a database. Maybe a few features are paid.

The model is the owner's other app, Kannada Kali (`yozo06/kannada-kali`): a web app opened from a link,
installed to the home screen, progress kept in the browser, a save code to move progress between devices,
and free hosting on GitHub Pages. No server, no accounts.

Why this shape: a link anyone can open is the cheapest way to put Arbor in real hands, and the WildArc
plan needs field use before it can go further. With no server there is nothing to pay for, nothing to
sign up for, and no shared data for a stranger to read.

## 2. What a person sees

1. They open the Arbor link on a phone. The first screen offers two things: **Start my farm** and **Look
   around the sample farm**. There is no sign-in.
2. They install it, before entering anything on iPhone. Chrome on Android offers "Install app", and a farm
   started in the browser carries over to the installed app. Safari on iPhone has no prompt, and an app
   added to the Home Screen keeps its own storage, apart from Safari's: a farm started in a Safari tab
   would not appear in the installed app, and Safari deletes a tab's data after about a week without a
   visit. So on iPhone the first screen leads with "Share, then Add to Home Screen", and starting a farm in
   Safari is allowed only after a warning **(my call)**. The card hides once the app runs installed.
3. They add zones, species and trees, log health and the work done, and open the Land Map.
4. They save. **Save my farm** downloads one file. **Open a farm file** loads one, after a warning that it
   replaces what is on the phone. The settings page shows when the farm was last saved, and the home screen
   nudges after seven days without a save.

## 3. Goals, non-goals, anti-goals

Goals:

- One set of screens, two ways of keeping data: **on the phone** (new) and **on a server** (today's API
  with Supabase).
- Installable on Android and iPhone from a GitHub Pages link.
- Data survives as well as a phone allows, and can always leave the phone as a file.
- Anyone can clone the repository and run the phone version with two commands and no accounts.
- People who need the server version can run it against their own Supabase project.
- A sample farm, so the link can be tried in a minute and the README has real screenshots.

Non-goals for this piece of work:

- Syncing between phones, or the "connect a database" option (later; section 8 keeps the door open).
- Payments of any kind.
- A Play Store or App Store listing.
- Changing the server version's behaviour, apart from the access work in step 6 (section 5).

Anti-goals, things that would make this a failure even if it works:

- Losing someone's farm without warning.
- Locking a person's own data behind a payment, or making export a paid feature.
- Any real farm's name, people or data in the public demo or the repository.
- A second copy of a formula in the app. Figures with a formula come from a `@wildarc/*` library.

## 4. How it is built

### 4.1 Two data modes, chosen when the app is built

A build setting `VITE_DATA_MODE` picks `local` (data on the phone) or `server` (today's API). `local` is
the default for `npm run dev` and for GitHub Pages; `server` is what the unified server build uses
**(my call)**.

The screens do not change. Today every screen reaches data through about thirty small functions in
`frontend/src/modules/arbor/api/`, `frontend/src/settings/api/` and `frontend/src/core/api/`. The local
version provides the same function names, arguments and returned shapes as the server does today, so a
screen cannot tell the difference. Which version a build gets is decided once, at build time, so the
Pages build carries no server code.

### 4.2 Where the data lives on the phone

IndexedDB, through the small `idb` wrapper **(my call)**. Not `localStorage`: it holds about 5 MB of
text per site, and photos would not fit. One database with a store each for trees, species, zones, health
entries, work entries and photos, plus a small record for the format version and the last-saved time.

On the first change, the app asks the browser to keep its storage (`navigator.storage.persist()`).
Browsers can otherwise clear it under storage pressure, and Safari on iPhone deletes a site's data after
about a week without a visit unless the app was added to the home screen.

If storage is blocked (some private windows), the app keeps working in memory, like Kannada Kali does, and
shows a banner: "This browser is not keeping your farm. Save it to a file before you close."

### 4.3 The farm file

Kannada Kali's save code is one line of text, which suits a game save of a few kilobytes. A farm with
photos runs to megabytes, so Arbor saves a file instead.

- One zip file, named like `arbor-farm-2026-11-12.zip`, holding `farm.json` (a format marker and version
  number, the save time, and every record: trees, species, zones, health entries, work entries) and the
  photos as JPEG files in a `photos/` folder **(my call)**. Photos written into the JSON itself would be
  turned into text, a third bigger, and the whole file would have to be held in memory to read it, which a
  large farm on an iPhone may not survive. A zip keeps photos as images and lets the app read them one at a
  time. It is still one file to keep safe. The small `fflate` library writes and reads it.
- Photos are shrunk on the phone before they are stored (longest side 1600 px, JPEG).
- This format is the part people will keep, so it carries a version number from the first save, and every
  later version of Arbor must still open version 1.
- Loading checks the file's format and version before touching anything, says what it found ("212 trees,
  48 photos, saved 3 November"), and replaces the farm on the phone only after the person confirms.
- The sample farm ships in the same format, so loading it exercises the same code.

### 4.4 Sign-in and roles on the phone

None. Whoever holds the phone is the farm's owner. Sign-in, sign-up, the Employees page and the role
checks stay in the server version only. A shared farm with workers comes back with the database option.

### 4.5 Figures

Dashboard counts and the zone summary are worked out on the phone, in the same shape the server returns
today. Biodiversity comes from `@wildarc/diversity` running on the phone, once that library is published
with its `v0.1.0` tag. Until then the phone version has no biodiversity card **(my call)**. The server
endpoint branch is then not needed for the phone version.

### 4.6 The public tree page

`/tree/:code` shows a tree to anyone with the link. On the phone version it can only show trees stored on
that phone. Tags meant for other people need the server version, so question Q4 in the roadmap (the
permanent web address for tags) stays with the server version.

### 4.7 Hosting on GitHub Pages

The same route as Kannada Kali: a workflow, `.github/workflows/pages.yml`, runs on every push to `main`. It
installs, runs the tests, builds the frontend in `local` mode for the address
`https://yozo06.github.io/wildarc-arbor/`, and publishes `frontend/dist`.

Serving from a sub-path needs:

- Vite's `base` set to `/wildarc-arbor/`, and the router told the same (`basename`).
- The web-app manifest's start address, scope and icon paths made relative (today they start with `/`).
- A copy of `index.html` saved as `404.html`, so a deep link such as `/wildarc-arbor/trees/T-001` opens
  the app instead of GitHub's error page **(my call; the alternative is `#` addresses)**.

The owner sets the repository's Pages source to "GitHub Actions" once, the same as for Kannada Kali.

The app also needs a name and an icon on the home screen. The manifest points at icons that were never
committed (there is no `frontend/public/` folder), and Chrome will not offer to install an app without
them. The page title still says "TMS". The phone version is called **Arbor**, with a simple tree mark in
the app's green (`#2A5934`) as the icon, at 192 px, 512 px and a 512 px maskable version **(my call; the
owner can swap in a real mark at any time)**.

### 4.8 The sample farm

A made-up farm, "Sample Food Forest": about 40 trees across 5 zones and 12 species, with some health and
work entries and no photos **(my call)**. It is labelled as sample data everywhere it shows, and **Clear
sample** returns to an empty farm. README screenshots are taken from it at phone size.

### 4.9 The server version, for those who need it

A `supabase/` folder with:

- `migrations/0001_baseline.sql`: the tables and views the code uses (including `zone_summary`,
  `map_tree_view` and `ecosystem_roles`, which no file creates today), rebuilt from the code's reads and
  writes and the existing files in `docs/migrations/`.
- `seed.sql`: the same sample farm, plus one owner sign-in for local use only.

It runs in a free Supabase project (paste into the SQL editor) or locally with the Supabase command line
and Docker. `.env.example` explains both. The baseline is a reconstruction. If the live project can be
dumped (roadmap Q1), the dump replaces it.

Two warnings go into those instructions **(my call: document, don't change the server here)**:

- The server version's sign-in rules are too open for a public address (roadmap section 2.3). Until the
  access work lands (step 6 in section 5), run it on your own computer or for people you trust.
- Photo upload in the server version goes to Google Drive and needs a Google service account and folder.
  The instructions cover that setup; without it, photo upload fails.

### 4.10 README and contributing

The README leads with what Arbor is, a **Try it** link, screenshots and "Install on your phone". Then:
run it locally (phone version: `npm ci` and `npm run dev` in `frontend/`; server version: the Supabase
steps), contributing, licence. `CONTRIBUTING.md` makes the phone version the default way to develop.

## 5. Order of building

Each step is a branch with its tests written first, stacked on the one before it so nothing is built
twice. Once the code is on GitHub they become pull requests in this order, and the owner merges them
**(my call)**.

0. Already built: the CI repair, then the Land Map. Step 1 builds on top of the Land Map, so the map's
   data needs are met once. The Land Map's "run against real farm data" check moves to the server version;
   on the phone version it is checked against the sample farm.
1. The data-mode switch and phone storage for trees, species, zones, health and work entries. No sign-in in
   `local` mode.
2. The farm file: save, open, the storage request, the last-saved nudge, the private-window banner, and
   the install-first screen on iPhone.
3. Photos on the phone: shrink, store, include in the file.
4. The name and icon, the sub-path build, the Pages workflow, the sample farm, README screenshots.
5. The Supabase baseline, the seed and the server-version instructions, with the two warnings in 4.9.
6. The access work (decision D8) on the server version, with tests. After it, the owner decides whether
   the live server moves to this repository (decision D7).

## 6. How we will know it works

- The test suites pass under Node 26 for both modes.
- Before the code is on GitHub, checks run on a computer. Chrome treats `localhost` as a secure address,
  so the service worker, the install offer and the storage request can all be tried there at phone size.
- Real-phone checks, and everything specific to iPhone, need the GitHub Pages link. They are the most
  likely source of rework, so they run as soon as the link is live.
- On a real Android phone and a real iPhone: open the link, install, add three trees with a photo, close
  the app, open it again, and the trees are there.
- Save a file, clear the site's data, open the file, and everything comes back, photos included.
- A fresh clone runs the phone version with `npm ci` and `npm run dev` and nothing else.

## 7. What changes in the roadmap

- Stage 0's access work (decision D8: close open sign-up, protect user details) still happens, on the
  server version only, as step 6. New people never touch the server.
- Decision D7 (hosting) splits: the phone version is on GitHub Pages; the live server keeps running from
  the old repository until the owner decides its future.
- Stages 1 and 2 (see the farm, work in the field) are built on the phone version first.
- The biodiversity endpoint branch is parked; the phone computes the figures itself.

## 8. Later: connecting a database

Kept in mind, not built now. Because every screen already goes through one set of data functions, a third
mode ("phone, synced to a database") can be added later without changing the screens. Records get
identifiers created on the phone (not numbers handed out by a server) from step 1, so a later sync does
not have to renumber anything **(my call)**.

## 9. Making money

Research done on 2026-11-12. Prices are from the linked pages on that date. Anything marked
*unverified* could not be confirmed.

### What shapes every option

- **A strong free competitor exists.** Plant-for-the-Planet's
  [TreeMapper](https://www.plant-for-the-planet.org/treemapper) is free for non-profits and communities,
  works offline and exports data. Nobody will pay for basic tree mapping.
- **Open-source apps like this sell convenience, not the app.**
  [Plausible](https://plausible.io/self-hosted-web-analytics) (AGPL) is funded only by its hosted service.
- **GitHub Pages cannot host the paid parts.** Its
  [limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) rule out
  online shops and paid software services. The free app stays on Pages; checkout and any paid sync live
  elsewhere.

### The options

| Option | Free | Paid, and by whom | Comparable prices | Effort | With AGPL-3.0 |
|---|---|---|---|---|---|
| **A. Supporters** | Everything | Optional one-time "supporter" payment or a yearly organisation licence; enthusiasts and NGOs | [Obsidian](https://obsidian.md/pricing): $25 one-time supporter badge, $50 per user per year optional commercial licence. [GitHub Sponsors](https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors) takes 0% and pays out in India | Very low | No conflict |
| **B. Grants** | n/a | Funders | [FOSS United](https://fossunited.org/grants/project): ₹20,000 to ₹9,00,000. [FLOSS/fund](https://floss.fund/faq/): $10k to $100k, not for very new projects. [NLnet](https://nlnet.nl/propose/): €5k to €50k, needs a European angle. [Rainmatter](https://rainmatter.org/): partnership enquiry only | Low | Funders often require an open licence |
| **C. Hosted backup and sync** | The phone app, the farm file, and running your own sync server | Monthly or yearly; owners with several phones | [Obsidian Sync](https://obsidian.md/sync) $4/month yearly. [Joplin Cloud](https://joplinapp.org/plans/) €2.99/month. [Farmier](https://farmier.com/pricing) (hosted farmOS) $75/year | High | The usual AGPL-plus-hosting pattern (Joplin, Standard Notes, Plausible) |
| **D. Team plan** | One person, one farm | Per user: worker roles, several farms, an NGO overview | [Excalidraw+](https://plus.excalidraw.com/pricing) $6/user/month. Joplin Teams €7.99/user/month | High; needs C first | Fine while the code stays AGPL |
| **E. Services and audit-grade exports** | Standard exports | Per project: data import, setup, carbon census pack, donor or certification reports; NGOs and carbon developers | Farmier offers custom imports on request; no public price for these (*unverified*) | Medium | Sell the work, not the code |
| **F. Selling AGPL exceptions** | AGPL for everyone | Companies that want Arbor inside a closed product | No public price (*unverified*) | Low to set up; demand unknown | Only the copyright holder can [sell exceptions](https://www.gnu.org/philosophy/selling-exceptions.html), so outside contributors would need to sign a contributor licence agreement |

Notes on E:

- **Carbon.** Verra's [VM0047 v1.1](https://verra.org/documents/vm0047-afforestation-reforestation-and-revegetation-v1-1)
  has a census-based route for trees planted on land that stays in farming. It needs a count of every
  planted tree, which a per-tree register gives. It allows at most 50 trees per hectare, so dense food
  forests do not qualify; boundary and agroforestry plantings may.
- **Organic certification.** India's PGS already runs its [own portal](https://pgsindia-ncof.gov.in/) for
  records, so an export would be a convenience, not a product.
- Demand for both is unverified. Pilot with real users before building anything.

### Taking payments

- [Razorpay](https://razorpay.com/pricing/) accepts an individual with a PAN. The fee is 2% in India and up
  to 3% international, plus GST on the fee. Overseas cards
  [need a registered business](https://razorpay.com/docs/payments/international-payments/); until then,
  PayPal or a bank transfer.
- [Stripe in India](https://support.stripe.com/questions/stripe-accounts-are-invite-only-in-india) is
  invite-only.
- [Lemon Squeezy](https://www.lemonsqueezy.com/pricing) handles sales tax for 5% + 50¢ per sale. Whether
  it pays out to India is *unverified*.
- Selling from Arbor's own site avoids any app-store cut. A Google Play listing as a Trusted Web Activity
  costs [$25 once](https://support.google.com/googleplay/android-developer/answer/6112435), but digital
  goods sold inside it must use
  [Play Billing](https://developer.chrome.com/docs/android/trusted-web-activity/receive-payments-play-billing).
  The simplest Play route is a free listing with no purchases inside.

### What stays free, always

- Everything about a person's own trees: unlimited trees, the Land Map, the work log, the biodiversity
  figures.
- Export and import in open formats, including after a subscription ends.
- The source of any sync server, so anyone can run their own.
- The calculation libraries (already MIT).
- A published promise: if a contributor licence agreement is adopted, it will not be used to close the
  code.

### Recommended order

1. **Now, nothing to build.** Turn on GitHub Sponsors and add a `funding.json` (FLOSS/fund asks for one).
   Add a supporter payment link, hosted off GitHub Pages. Apply to FOSS United; send Rainmatter a
   partnership enquiry. Publish the "stays free" promise. Decide on a contributor licence agreement before
   the first outside pull request is merged; that keeps option F open.
2. **Next, little to build.** Offer paid setup and data import to two or three farms or NGOs. Pilot a
   carbon census export and a donor report with them before charging for either.
3. **Later.** Hosted sync (C), then the team plan (D). This is the main recurring income, and it needs a
   backend, accounts and support. It is the "connect a database" option from section 8, sold as a service.
4. **Once usage grows.** Apply to FLOSS/fund. Offer AGPL exceptions only if a company asks.

None of the comparables publish prices in rupees. A starting guess of ₹99 to ₹199 a month for sync is an
estimate, not a sourced figure.

## 10. Open with the owner

1. **Your own farm and the live server.** Default **(guess)**: your farm stays on the live server for now,
   with its workers, unchanged. The phone version is for everyone else until the database option lets a
   farm with workers share data. The access work (step 6) then lands on the server version, and moving the
   live site to this repository (D7) waits for your go-ahead. Moving your farm onto the phone now would
   instead need an "export as farm file" on the server first, its photos fetched from Google Drive, and it
   would lose the worker assignments.
2. **Which way of making money to try first** (section 9). Recommended: supporters and grants now. Nothing
   in this build depends on the choice.
3. **A contributor licence agreement**, before the first outside pull request is merged. Without one, the
   option to sell AGPL exceptions (9F) closes as soon as someone else's code is in.
4. **Publishing.** GitHub Pages, the repository settings, the pull requests and every real-phone check
   need the two repositories created and `main` pushed.

## 11. Left to the builder

- Component structure, the details of the IndexedDB wrapper, the test layout (for example
  `fake-indexeddb`), and the wording on screen.
- How identifiers made on the phone sit beside today's numeric ones, and giving the phone's one person the
  `owner` role so today's role checks pass unchanged.
- What the phone version returns for users, contributors and ecosystem roles, and any server calls made
  outside the three data folders.
- Setting `VITE_DATA_MODE=server` wherever the server build is configured.
- The exact contents of the sample farm, as long as it is clearly made up and names no real farm or
  person.
