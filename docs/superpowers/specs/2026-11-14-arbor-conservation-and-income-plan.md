# Arbor and conservation: where it can help and how it could earn

Status: research and proposal, not yet approved by the owner. Date: 2026-11-14. Builds on section 9
("Making money") of the [phone-first design](2026-11-12-arbor-phone-first-design.md).

This keeps section 9's order (supporters and grants, then paid services, then hosted sync). Where it
changes a detail of section 9 or of the roadmap, it says so. All stages are built in the phone version
only.

## 1. The short answer

- Yes, Arbor can help conservation work. It fits small groups that look after a known set of trees for
  years: small restoration groups, groves, campuses, collections, and groups that plant with someone
  else's money and must later say which trees are alive.
- The clearest opening is an honest survival record. A 2024 global study of 99 tree-planting
  organisations found only 41% reported survival data
  ([UC Santa Cruz](https://news.ucsc.edu/2024/01/reforestation-best-practices/)). In India, an audit for
  CRISIL Foundation found survival from 9.4% to 91% across 11 sites
  ([CRISIL audit, 2024](https://integraliq.crisil.com/content/dam/crisil/crisil-foundation/generic-pdf/crisil-re-tree-audit-report-2024.pdf)).
- Arbor already has the hard part: each tree keeps its own history, offline, with no account, in a file
  the group keeps.
- Arbor cannot do the job yet. It has no dead or not-found state, no real-world position, and no export
  other than the farm file.
- A record in Arbor is self-reported. It is a record, not proof.
- The app stays free. In the first year the only money with a known source is small sponsorships and, if
  an application succeeds, one Indian grant. Paid setup work has no confirmed buyer yet. Stages 1 to 3
  are unpaid work unless the grant comes through.
- That funded planting groups want a tree-by-tree register is a guess to test, not a finding. Talk to two
  or three real groups before any large build.

## 2. Who could use it

There are two tracks. Track A owes a funder a report, so money may exist. Track B is conservation proper,
where the fit is strong but no payer was found. No published budget for tree monitoring software in India
was found, so "who pays" names the source of money, not an amount.

### Track A: groups that owe a funder a report

**A1. Small and mid-size Indian non-governmental organisations (NGOs) planting with company money. Start
here, as a hypothesis.**
- Today: not confirmed. The CRISIL audit sampled 0.1-hectare plots with the free TreeMapper app. It
  recommended monthly photo records and a GPS or boundary file made before work starts
  ([CRISIL audit](https://integraliq.crisil.com/content/dam/crisil/crisil-foundation/generic-pdf/crisil-re-tree-audit-report-2024.pdf)).
  The World Resources Institute (WRI) asks for a full count only on sites under 0.5 hectares
  ([WRI, January 2026](https://africa.wri.org/sites/default/files/2026-01/land-restoration-from-planting-to-proof.pdf)).
  So audits mostly work on a site boundary plus samples, not on every tree.
- Need, in two forms. Light: site boundary, planting batch with a count, a sample or full count at each
  visit, dated photos. Full: a record for every tree, which suits small sites.
- Who pays: corporate social responsibility (CSR) budgets, the money Indian companies must spend on
  social causes. Environmental CSR was 8.4% of CSR spending in 2023-24
  ([National Herald, citing Sattva](https://www.nationalheraldindia.com/environment/environmental-csr-spending-rises-but-remains-just-84-pc-in-fy24-report)).
  The share spent on planting is not published. Monitoring and evaluation costs sit outside the 5% cap
  on administrative overheads
  ([Corporate Professionals](https://www.corporateprofessionals.com/articles/administrative-overheads-on-csr-whats-in-whats-out/),
  a secondary source), which is the nearest thing to a reason an NGO could budget for this.
- Why first: these groups are near the owner, and an NGO can receive CSR money and pay for work. Ask each
  one: "Does your funder want every tree or a sample?"
- A caution. A May 2026 James Cook University study is reported to have found that groups stop monitoring
  when funder requirements end, for lack of money, staff and skills
  ([NESP](https://nesplandscapes.edu.au/2026/05/14/new-study-highlights-gaps-in-rainforest-restoration-monitoring/);
  the page could not be re-read for this plan, so not confirmed). The limit is field time, not software.

**A2. Dense "Miyawaki" plots, campus and school plantings.**
- The three Miyawaki plots in the CRISIL audit were at 19.4%, 21.8% and 40% survival.
- These plots hold several saplings to a square metre. Following each sapling is impractical and phone GPS
  cannot separate them. Offer counts by species for the plot and photos from fixed points. Campuses with
  spaced trees can use the full per-tree record.
- Who pays: the sponsoring company or institution. What sponsors require is not confirmed.

**A3. Companies and assessment firms that need an independent count.**
- Large CSR spenders must commission independent impact assessments. Law-firm notes give the thresholds as
  an average CSR obligation of Rs 10 crore or more and projects of Rs 1 crore or more, with the cost
  capped at 2% of CSR spend or Rs 50 lakh ([Nishith Desai](https://www.nishithdesai.com/default.aspx?id=8302)).
  This is from secondary sources; a 2026 change is not confirmed.
- Need: a tree list to sample on site and mark found, not found or dead. A later customer.

### Track B: conservation users, no payer found

- Small restoration groups, community and sacred groves.
- Heritage and old-tree registers, botanic collections, and projects that watch the same trees every
  season. Details of these were not confirmed for this plan.
- Biodiversity assurance. The Global Biodiversity Standard assesses restoration sites, and lists Auroville
  Botanical Gardens as a regional hub ([The Global Biodiversity Standard](https://www.biodiversitystandard.org/)).
  That is one contact worth approaching.
- Treat track B as goodwill and as evidence for grants, not income.

Large planters (SankalpTaru, Grow-Trees, Farmers for Forests) built their own systems and are not
customers.

## 3. What Arbor has and what is missing

Efforts are for the phone version only. The server version does not get these features until its access
work is done. Expect roughly double the effort for anything that must exist in both.

| Need | Arbor today | Effort |
|---|---|---|
| Unique tree ID | Has | none |
| Species, planting date | Has | none |
| Lists and search beyond 100 trees | Missing. The list stops at 100; search is by code only | small |
| Alive, dead or not found, with date and cause | Partly. A removed tree can be marked cut and completed (roadmap rule D4). No dead or not-found state, no date or cause, and delete erases the history | small to medium |
| Planting batch | Missing. Trees have only a planting date and a zone | small |
| Planted or naturally regenerated; existing tree | Missing | small |
| Who planted it | Missing | small |
| Link from a dead tree to its replacement | Missing | small |
| Height over time | Has, in the health log | none |
| Trunk diameter over time | Partly. One current value, edit screen only | small |
| Dated photos | Partly. Stores upload time, not camera time | small to medium |
| Record of every edit | Partly. Creation, status changes, photos, typed work entries and health entries are kept; edits to a tree's other fields are not | medium |
| Real-world position with accuracy | Missing. Position is metres on a local grid | medium |
| Site boundary other tools can read | Partly. The Land Map draws a stored zone outline, but no screen lets a person draw or edit one, and outlines have no real-world anchor | medium |
| Spreadsheet (CSV) export | Missing | small |
| Map file export (GeoJSON, KML) | Missing | small after position |
| Withholding rare-species positions | Missing | small to medium |
| Survival report, printable | Missing | medium (includes a cited library) |
| Native, introduced, threatened flag on species | Missing | small |
| Biodiversity figures | Partly. The @wildarc/diversity library exists but the app does not use it. Install from the GitHub tag or publish to npm first | small |
| Adding hundreds of saplings, spreadsheet import | Missing | medium |
| Printable tag for each tree | Missing | small, for a tag that shows the code only |
| Several sites | Missing. One browser holds one farm | medium |
| Several workers combining data | Missing. Opening a file replaces the farm | large |
| Local languages | Missing | medium |
| Offline, no account | Has. Real Android and iPhone checks are pending | none |

## 4. What to add, in stages

**What stays free, always.** Section 9's list, in full:

- Everything about a person's own trees: unlimited trees, the Land Map, the work log, the biodiversity
  figures.
- Export and import in open formats, including after a subscription ends.
- The source of any sync server, so anyone can run their own.
- The calculation libraries.
- A published promise: if a contributor licence agreement is adopted, it will not be used to close the
  code.

One addition: the survival figures and the printable report on the owner's own device are also free.

**What could be paid.** The owner's time, and later hosting. This narrows section 9's option E: the report
and every export are free in the app; only the work of setting up, importing and preparing a report for a
group is paid.

**Stage 0. Now, almost nothing to build.**
- Link preview picture. The owner has asked for this. Merge pull request #5, or put its one preview commit
  on main alone if the rest is not ready. The site republishes by itself. Chat apps that already fetched
  the link may show the old preview for a while.
- Fix the README. Survival and diversity are not in the app yet; growth is recorded as height per health
  entry but not charted.
- Add the contributor licence agreement to CONTRIBUTING.md. Until then, do not merge an outside pull
  request.
- Publish the "stays free" promise. Add `funding.json` and `FUNDING.yml`.
- One conversation with a chartered accountant about sponsorships and grants from abroad, before GitHub
  Sponsors is switched on. The supporter payment link in section 9 waits for the same advice.
- Send Rainmatter Foundation a short enquiry, as section 9 says.
- Talk to two or three planting groups near Bengaluru, and write to Auroville Botanical Gardens.
- Check whether Farmers for Forests has released its platform as open source. In 2024 it was "preparing
  to" ([TriplePundit](https://www.triplepundit.com/story/2024/india-pays-farmers-forests/801181)).
- Worked if: two conversations are held and the picture shows on a new share.

**Stage 1a. The survival record.**
- Built: a life state for each tree (alive, dead, not found, removed) with date and cause. A record of
  every edit. Planting batch and a link from a dead tree to its replacement. A small survival function in
  a `@wildarc` library with a counting rule from a published source, because the approved designs forbid
  formulas inside the app. Lists and search past 100 trees. Photos always re-encoded, with the camera date
  read first. The translation file structure, English only.
- This replaces D4's standing-tree rule. Trees already marked cut and completed are mapped to "removed"
  when a farm file is opened. Delete stays for mistaken entries.
- Worked if: a planting recorded in the phone version shows a survival figure by species and batch. The
  owner's own farm is on the server version and is not part of this test.
- Unlocks: a credible grant pitch.

**Stage 1b. Getting data out.** CSV export, "planted by" (optional), planted or regenerated, and diameter
per visit. Height already lives in the health log, so diameter joins it there; this replaces the roadmap's
separate measurements table for the phone version. With a written ownership and privacy statement, this
closes the gaps for a Digital Public Good listing (section 5).

**Stage 1c. Diversity.** The species flag and the diversity card. It depends on 1a, because the life state
decides which trees count.

**Stage 2. Real-world position.**
- Built as roadmap section 4.2 already settles: one origin for the farm, optional GPS per tree, and the
  dragged map position is the truth. Add a direction for north (or a second known point), because one
  point cannot fix a drawn map. Exported points are worked out from the map position and the origin, each
  labelled as measured or estimated, with the raw reading and its accuracy beside it.
- Also: an outline editor, GeoJSON and KML export, and a printable sheet of tags showing the tree code.
  Verra's method accepts a durable tag in place of GPS
  ([Verra VM0047 v1.1](https://verra.org/documents/vm0047-afforestation-reforestation-and-revegetation-v1-1/)).
  Tags that open the tree for other people wait for the server version and a permanent address (roadmap
  Q4). Cost the tags before promising them.
- Shipped with the first export that carries coordinates: a "withhold position" switch per species or
  tree, respected by every export, with a line saying what was withheld.
- Worked if: an exported file lands in the right place in another map tool.

**Stage 3a. Loading real data.** Bulk sapling entry, spreadsheet import, a test with a few thousand trees,
and the real-phone checks. This comes before any pilot holds real data.

**Stage 3b. The report and the first pilot.**
- Built: a "monitoring round" that walks through every tree due a check, an audit-visit mode for a second
  person to sample trees, and a printable report by batch, species and zone with the method stated and a
  dated photo sheet. The report can flag the 80% level WRI treats as healthy, and the 70% minimum WRI's
  TerraFund programme accepts ([WRI](https://africa.wri.org/sites/default/files/2026-01/land-restoration-from-planting-to-proof.pdf)).
- For pilots, treat each site as a zone in one farm file, or use one file per site. No multi-site build.
- Worked if: one real round is timed and takes minutes per hundred trees, one group sends a report to its
  funder, and one group pays any amount for setup.

**Stage 4. Reach.** A second language when a pilot group needs it, rounding options for positions, and a
species export with standard field names.

**Stage 5. Several people, then organisations.** Real multi-site, following roadmap decision D6. Then
choose one of two answers to the same need after the pilots: merging a worker's file, or hosted sync.
Sync is opt-in; without it nothing leaves the device. A read-only view for a funder is a later option.

Rough total for Stages 1 to 3: six to nine months of spare time. This is a guess, not a measurement.

## 5. How it could earn

In the order to try them.

1. **GitHub Sponsors.** No fee when an individual sponsors; up to 6% when an organisation account
   sponsors. India is a supported payout region
   ([GitHub](https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors)).
   Expect small sums. Most sponsors would be abroad, so the accountant comes first.
2. **FOSS United grant.** For Indian projects: up to Rs 15 lakh, median Rs 3 to 7 lakh over a year, with
   milestones in `funding.json` and one community engagement each quarter
   ([FOSS United](https://fossunited.org/grants/thesis)). Plan on the low end of the median. It asks
   whether the project is already in use, and Arbor has one known user, so apply after Stage 1a with
   Stages 1 to 3 as milestones. Do not wait long: a February 2026 board note says a new Maintainers
   Program will cover the grants budget, so the scheme may change
   ([FOSS United board notes](https://fossunited.org/blog/organization/notes-from-the-february-2026-governing-board-meeting)).
   No deadline is stated. This corrects section 9's figure of Rs 20,000 to Rs 9,00,000.
3. **Paid setup work for NGOs.** What is sold: the owner's time to import an existing spreadsheet, clean
   it, set up sites and train staff, for groups with no technical person. The NGO pays from its project
   budget. Willingness to pay is not confirmed, and no price for this work was found. Donors pay Rs 85 to
   Rs 110 for a whole planted tree on Grow-Trees' Indian projects
   ([Grow-Trees](https://www.grow-trees.com/plant/single-gateway-qp.php)), so any monitoring fee has to be
   a small part of that. Price per site or per day after the pilot. Company money can only reach Arbor
   this way: CSR implementing agencies are limited to registered trusts, societies and Section 8
   (not-for-profit) companies, and government bodies. Individuals are not on the list. An independent NGO
   partner must hold 12A and 80G tax registrations, have a three-year record and have filed Form CSR-1
   ([India Briefing](https://www.india-briefing.com/news/navigate-indias-new-csr-1-requirements-essential-guide-for-businesses-38648.html)).
4. **Digital Public Good listing**, after Stage 1b. This is a public register of open tools. No money, but
   credibility. It needs clear ownership, a privacy statement, documentation and open-format export
   ([DPG Standard](https://github.com/DPGAlliance/DPG-Standard/blob/main/standard.md)).
5. **WILDLABS Awards.** The 2026 round gave $350,000 across 15 projects, with interest due 18 March 2026
   ([WILDLABS](https://wildlabs.net/node/27403)). The 2027 round is not announced. Whether individuals
   qualify is not confirmed. It needs one real conservation user first, which is what track B is for.
6. **Hosted sync, later.** Others charge by size. Mergin Maps has a free Non-Profit plan for organisations
   with annual budgets under EUR 30,000; paid plans run from EUR 25 to EUR 399 a month (the top one a
   launch price, list EUR 599), with Enterprise from EUR 799. Larger NGOs get 20% to 60% off
   ([Mergin Maps](https://merginmaps.com/pricing)). Wildlife Insights charges companies and governments,
   but not government agencies in developing economies
   ([Wildlife Insights](https://wildlifeinsights.org/pricing)). Who would pay Arbor is not confirmed:
   perhaps mid-size NGOs with several sites, and companies or assessment firms wanting a view across
   sites. The paying rule covers our hosting and our time only. Self-hosting stays free for everyone.
7. **FLOSS/fund, once usage is visible.** $10,000 to $100,000, but not for very new or little-used
   projects ([FLOSS/fund](https://floss.fund/faq/)).

Long shots. NLnet's Commons Fund closed on 1 June 2026; its newer funds are open until 3 January 2027 but
target internet infrastructure ([NLnet](https://nlnet.nl/propose/)). This corrects section 9. Rainmatter
Foundation funds ecology work, but its application route is not confirmed
([Bridgespan](https://www.bridgespan.org/insights/funder-profiles-pay-what-it-takes-principles-in-action/rainmatter-foundation)).

What each route needs first:

- The contributor licence agreement, before the first outside contribution.
- The accountant's advice before any money from abroad. Fees for services are excluded from India's
  foreign-contribution rules ([Taxmann](https://www.taxmann.com/post/blog/foreign-contribution-under-fcra)).
  How a foreign grant or sponsorship to an individual is treated is not confirmed, and the earlier
  research was split on whether Sponsors needs the advice. The rules were reported amended in mid-2026
  ([PwC India note](https://www.pwc.in/assets/pdfs/news-alert/regulatory-insights/2026/pwc_india_regulatory_insights_1_july_2026_key_amendments_introduced_to_foreign_contribution_regulation_rules.pdf);
  not re-read for this plan).
- Goods and services tax registration once yearly receipts pass about Rs 20 lakh (secondary source,
  [Skydo](https://www.skydo.com/blog/gst-for-freelancers)).
- A GitHub organisation account, if an outside body is ever to hold money for the project
  ([Open Source Collective](https://docs.oscollective.org/interested-in-joining-osc/acceptance-criteria.md)).

## 6. Things to be careful about

- **Rare species locations.** A shared file with positions can lead someone to a rare tree. Follow the
  Global Biodiversity Information Facility guide: round or withhold, never invent false points, and say
  what was done ([GBIF](https://docs.gbif.org/sensitive-species-best-practices/master/en/)). This is why
  the withhold switch ships in Stage 2. Apply it to photo positions too.
- **Photos can leak location today.** A JPEG already 1600 px or smaller is stored unchanged, so any
  location inside it travels in the farm file. Larger photos are re-encoded and lose it. Fix: always
  re-encode. Effort: very small.
- **Other people's data.** Data on the user's own device keeps the owner out of India's data-protection
  duties. Hosted sync with worker or farmer names would bring them in; the main duties start about 13 May
  2027 ([Press Information Bureau](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf)).
  Setup work also means handling a group's file on the owner's machine. Agree in writing what is kept and
  delete it after the job. Whether that brings any legal duty was not researched; ask the accountant or a
  lawyer. Keep people's names optional.
- **Promises the app cannot back.** A survival figure is what the user recorded. Print the method and
  dates on every report and call it a record. On carbon, two things are separate. The roadmap's cited
  carbon estimate on the owner's own dashboard stays as planned. What is ruled out is carbon credit
  claims, verification, and anything on a survival report that implies credits. This drops the carbon
  census pilot from section 9 step 2, because Verra's tree-by-tree route is capped at 50 trees per
  hectare and no buyer was found. A plain export of ID, point, year and species covers the need.
- **AGPL and paid features.** Sell work and hosting, not closed code. Under the licence anyone may run the
  app and any sync server themselves.
- **Relying on hosting alone.** OpenTreeMap's maker stopped developing it while still serving paying
  customers ([Azavea, 2019](https://groups.google.com/g/opentreemap-user/c/AKfGxBj6pXY)). Why is not
  confirmed. Keep services and grants beside any hosted plan.
- **The web address.** Browser storage is tied to the site address. If the site moves, every farm kept on
  a device stays behind at the old address. Installed apps and printed tags break too.
- **Field time.** A monitoring round must take minutes per hundred trees, or groups will not do it.
- **One-person support load.** Take two or three pilots, not ten.
- **The server version.** Its sign-in rules are not safe for a public address. Do not pilot on it.

## 7. What not to do

- **Do not charge for mapping or offline capture.** TreeMapper is free and was used in the CRISIL audit
  ([TreeMapper](https://www.plant-for-the-planet.org/treemapper)). Free form tools such as KoboToolbox,
  ODK and Epicollect5 also exist. Arbor's edge is narrower: the same tree followed over years, data kept
  by the group, no account.
- **Do not build verification, tokens, carbon credits or satellite analysis.** Carbon Direct bought
  Pachama on 10 November 2025 as carbon markets softened
  ([TechCrunch](https://techcrunch.com/2025/11/10/consolidation-begins-to-hit-the-carbon-credit-market/)).
- **Do not build for government schemes or Green Credit.** Schemes use their own portals. Green Credit,
  as revised on 29 August 2025, turns on 40% canopy after five years
  ([Mongabay India](https://india.mongabay.com/2025/09/green-credit-rules-tweaked-to-favour-canopy-cover-remove-trade-provision/)).
  Whether a participant's own tree record counts for anything is not confirmed. Watch it.
- **Do not chase city tree inventories.** City work goes by tender to contractors, which one person
  cannot bid for. Abroad, that market has products at $1,500 to $3,500 a year
  ([G2](https://www.g2.com/products/treeplotter-inventory/reviews),
  [Software Advice](https://www.softwareadvice.com/cafm/treeplotter-inventory-profile/)). Campuses stay
  in.
- **Do not build the farmer registration pack yet.** Model rules of June 2025 ask a farmer for a boundary
  file, geo-tagged photos and tree counts
  ([Press Information Bureau](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/jun/doc2025629578501.pdf)).
  Whether the portal is live and which states adopted the rules is not confirmed.
- **Do not build multi-site before one group uses one site.** The roadmap already says this.

## 8. Questions for the owner

1. **Which group first?** Default: small Indian NGOs with funded plantings, as a hypothesis, with one
   track B contact alongside.
2. **Thumbnail: alone or with the desktop branch?** Default: merge pull request #5 if it is ready.
3. **Replace rule D4 with the life state?** Default: yes.
4. **Publish a "who is always free" rule?** Default: yes. Everyone may self-host free. Individuals,
   farmers and small non-profits get our hosting free; larger bodies pay for hosting and services.
5. **Take money from abroad?** Default: not until the accountant confirms.
6. **Form a legal entity?** Default: no. Work as a paid supplier to an NGO, and revisit after a first paid
   pilot.
7. **Move to a GitHub organisation?** Default: move before real users have data, or adopt a custom domain
   first so the address never changes again. Before any move, tell users to save their farm file. Update
   the two addresses in the page tags in the same change. This also answers roadmap Q4.
8. **Confirm roadmap section 4.2 still stands**, with a north direction added. Default: yes.
9. **How much pilot time?** Default: two or three groups, the first unpaid in return for honest feedback.

## 9. Sources

Standards and needs
- [Verra VM0047 v1.1](https://verra.org/documents/vm0047-afforestation-reforestation-and-revegetation-v1-1/)
- [WRI, Land restoration: from planting to proof, January 2026](https://africa.wri.org/sites/default/files/2026-01/land-restoration-from-planting-to-proof.pdf)
- [CRISIL Foundation tree audit, 2024](https://integraliq.crisil.com/content/dam/crisil/crisil-foundation/generic-pdf/crisil-re-tree-audit-report-2024.pdf)
- [GBIF sensitive species guide](https://docs.gbif.org/sensitive-species-best-practices/master/en/)
- [UC Santa Cruz, study of 99 organisations, 2024](https://news.ucsc.edu/2024/01/reforestation-best-practices/)
- [The Global Biodiversity Standard](https://www.biodiversitystandard.org/)
- [NESP, rainforest restoration monitoring study, May 2026](https://nesplandscapes.edu.au/2026/05/14/new-study-highlights-gaps-in-rainforest-restoration-monitoring/) (not re-read)

Tools
- [TreeMapper](https://www.plant-for-the-planet.org/treemapper)
- [TreePlotter on G2](https://www.g2.com/products/treeplotter-inventory/reviews) and [Software Advice](https://www.softwareadvice.com/cafm/treeplotter-inventory-profile/)
- [Mergin Maps pricing](https://merginmaps.com/pricing)
- [Wildlife Insights pricing](https://wildlifeinsights.org/pricing)
- [OpenTreeMap status, Azavea, 2019](https://groups.google.com/g/opentreemap-user/c/AKfGxBj6pXY)
- [TechCrunch on Pachama, November 2025](https://techcrunch.com/2025/11/10/consolidation-begins-to-hit-the-carbon-credit-market/)
- [TriplePundit on Farmers for Forests, 2024](https://www.triplepundit.com/story/2024/india-pays-farmers-forests/801181)

India
- [Mongabay India on Green Credit rules, September 2025](https://india.mongabay.com/2025/09/green-credit-rules-tweaked-to-favour-canopy-cover-remove-trade-provision/)
- [Model felling rules, Press Information Bureau, June 2025](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/jun/doc2025629578501.pdf)
- [CSR impact assessment, Nishith Desai](https://www.nishithdesai.com/default.aspx?id=8302)
- [CSR administrative overheads, Corporate Professionals](https://www.corporateprofessionals.com/articles/administrative-overheads-on-csr-whats-in-whats-out/)
- [CSR implementing agencies, India Briefing](https://www.india-briefing.com/news/navigate-indias-new-csr-1-requirements-essential-guide-for-businesses-38648.html)
- [Environmental CSR share, National Herald](https://www.nationalheraldindia.com/environment/environmental-csr-spending-rises-but-remains-just-84-pc-in-fy24-report)
- [Grow-Trees prices](https://www.grow-trees.com/plant/single-gateway-qp.php)
- [Data protection rules, Press Information Bureau, November 2025](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf)
- [Foreign contribution rules, Taxmann](https://www.taxmann.com/post/blog/foreign-contribution-under-fcra)
- [Foreign contribution rule amendments, PwC India, July 2026](https://www.pwc.in/assets/pdfs/news-alert/regulatory-insights/2026/pwc_india_regulatory_insights_1_july_2026_key_amendments_introduced_to_foreign_contribution_regulation_rules.pdf) (not re-read)
- [Goods and services tax threshold, Skydo](https://www.skydo.com/blog/gst-for-freelancers)

Income and grants
- [GitHub Sponsors](https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors)
- [FOSS United grants](https://fossunited.org/grants/thesis)
- [FOSS United board notes, February 2026](https://fossunited.org/blog/organization/notes-from-the-february-2026-governing-board-meeting)
- [FLOSS/fund](https://floss.fund/faq/)
- [NLnet](https://nlnet.nl/propose/)
- [Digital Public Goods Standard](https://github.com/DPGAlliance/DPG-Standard/blob/main/standard.md)
- [WILDLABS Awards 2026](https://wildlabs.net/node/27403)
- [Open Source Collective criteria](https://docs.oscollective.org/interested-in-joining-osc/acceptance-criteria.md)
- [Rainmatter Foundation profile, Bridgespan](https://www.bridgespan.org/insights/funder-profiles-pay-what-it-takes-principles-in-action/rainmatter-foundation)

Arbor itself
- [Phone-first design](2026-11-12-arbor-phone-first-design.md), sections 3, 4 and 9
- [Roadmap](2026-11-12-arbor-roadmap-design.md), section 4.2, decisions D4 and D6, question Q4
- Code read on branch `feature/arbor-desktop-layout`; pull request #5 for the link preview
