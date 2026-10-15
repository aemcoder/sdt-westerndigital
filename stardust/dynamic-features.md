<!-- stardust provenance: skill=stardust:replica (dynamics Phase 3, curated) · writtenAt=2026-09-18T07:10:00Z · input stardust/current/_dynamics.json (3 archetypes, 25 findings) + reach from 106 crawled pages · draft stardust/dynamics/dynamic-features.generated-plan.md · target probe https://main--sdt-westerndigital--aemcoder.aem.live (6/6 first-party API paths dead = host-bound) -->
# Dynamic features — westerndigital.com

Hands-off run: every non-`self` row ships its interim tier now; the owner decision is named in
§ Decision batch and recorded as an assumption in `stardust/direction.md`. The static recreation of
the three archetypes never waits on any row below.

## Listings contract

- **press-release** (`/company/newsroom/press-releases/**`, 354 pages): each page emits
  `<meta name="template" content="press-release">`, `<meta name="publication-date" content="YYYY-MM-DD">`,
  `<meta name="dateline" content="SANTA CLARA, Calif.">`, `<meta name="category" content="Press Releases">`,
  `description` (first paragraph). The newsroom hub and "Newsroom Spotlights" rail read `query-index.json`
  filtered on `template=press-release`, sorted by `publication-date` desc — document-first: the hub's
  authored rows carry the spotlight cards; the index tops up beyond them. (`helix-query.yaml` is written
  at rollout, phase "search".)
- **event** (`/company/newsroom/events/**`, 16 pages): `template=event`, `event-date`, same index.
- **explore/documents** (10 pages): `template=resource`, `resource-type` (Case Study / White Paper).
- **products** (row 14, PLPs only — not an index listing): the 7 `product-listing` pages are fed by the storefront's product
  search API, not by `query-index.json`. Contract = the block's authored rows, already present in every published PLP document:
  `categories` (storefront category codes, e.g. `cat_internal, cat_hard_drives`), `condition` (`default` | `recertified` | `outlet`),
  `page-size`, `sort` (default label), `filters` (facet group names, rail order = the API's facet names), plus the captured
  first-page tile rows (document-first: authored tile text wins for the products it carries). URL state is the live one:
  `?filterBy<FacetCode>=a,b` and `?page=N`. PDPs, compare and quick-view stay on the storefront (decided-out, § Register).

## Features

| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | header-mega-menu | Products / Solutions / Support / Company mega-menus + mobile hamburger | M | 106/106 | rebuild-native | self | pending (rollout D2; header block JS) | chrome-interaction | none — motion-observe evidence at gate time | header experiencefragment, hidden panels in DOM |
| 2 | site-search | header search overlay, JS-submitted `q` → `/search?q=` | S | 105/106 | index-backed | self | interim: search box submits to `/search` (results page authored at rollout "search" phase) | search-index-backed | results-page corpus = migrated pages only (products excluded, they stay on the commerce host) | `text:q` form on every page |
| 3 | hero-carousel | home Splide hero (4 slides, autoplay, progress-bar tabs) | M | 1/106 | rebuild-native | self | pending (archetype block `hero-carousel`) | chrome-interaction | none | splide01, 4 slides + clones |
| 4 | card-rails | home Splide card rails (Legacy ×7, Popular Products ×6, Case Studies ×N); Featured Hard Drives on solutions pages | M | ~12/106 | rebuild-native | self | pending (block `cards` variants, scroll-based rail per recreation-procedure § Swiper-lock) | chrome-interaction | none | splide02–04 |
| 5 | category-tabs | home Shop by Category / Solutions / Industries tab view | M | 1/106 | rebuild-native | self | pending (block `category-tabs`) | tabs | none | store-tabview |
| 6 | wd-modal | `wd-modal-btn` triggers (resource-center modals, video modals) | M | 24 pages (reach 224 triggers) | rebuild-native | self | pending (rollout D2, `#modal` link markers → modal block) | modal | none | 1 trigger on corporate-responsibility (chrome-only at capture) |
| 7 | youtube | YouTube embeds (video sections, modal players) | V | 3/3 probed | embed-passthrough | self | pending (auto-block from URL in `buildAutoBlocks`) | media-as-url | none — player ids are public | www.youtube.com |
| 8 | region-selector | Country/Region link + `/region-selector` fed by `regiondetail.xlsx.exceltojson.json` | D | 105/106 | data-fed | self | interim: footer link to `/region-selector`; region page authored from a synced sheet (`data/region-details.json`) | sheet-sync | none (sync from source origin; dead on target) | GET …/regiondetail.xlsx.exceltojson.json → 200 (source), 404 (target) |
| 9 | product-reference-data | `/bin/wd/cache/commerce/productreference.en-us.json` (product names/links used by cards) | D | 105/106 | static-snapshot | self | interim: card text authored verbatim from the capture; snapshot kept under `data/productreference.en-us.json` for rollout top-up | sheet-sync | none | dead on target (404) |
| 10 | custom-promotions | `/bin/wd/cache/commerce/custompromotions.en-us.json` (promo strings on 20 pages) | D | 20/106 | static-snapshot | self | interim: captured promo text authored verbatim; unfreeze when commerce is decided | sheet-sync | see § Decision batch (commerce) | dead on target |
| 11 | utility-promo-bar | header promo-carousel ("WD Named to 2026 S&P…") | CR | 106/106 | static-snapshot | self | interim: single captured slide authored in `/nav` section 1 | read-settings | none — authors edit the nav doc | promo-carousel |
| 12 | cart-hydration | `/store/cart/getCart`, `priceAndInventory`, cart icon count, prices on product cards | X/A | 105/106 | decided-out | needs-backend | decided-out | decided-out | **owner: commerce on the new host?** — interim: cart icon links to `https://www.westerndigital.com/store/cart`; captured prices authored as static text | session-bound; dead on target |
| 13 | account-links | sign-in / My Account / registration | X | 106/106 | decided-out | needs-backend | decided-out | decided-out | owner (same as 12) — links stay absolute to the source host | `/store/my-account`, `/store/business/registration` |
| 14 | product-catalog | PLP grids + facets (counts, +More/−Less, chips, Clear All), sort, pagination, `filterBy…`/`page` URL state; campaign tile (slot 3). PDP, compare, quick-view stay on the storefront | CR/X | 7 `product-listing` PLPs (+ nav/home/use-case-chip deep links into `filterBy…` states) | data-fed (PLP) · decided-out (PDP/compare/quick-view) | self | done (PLP; campaign tile = code-bus snapshot 2026-10-15, interim) · decided-out (PDP/compare) | off-origin-data (feed the existing API; Tier 2 snapshot for the campaign feed) | none required to ship; named for production: **keep `api.westerndigital.com` CORS open to the new host** (today it echoes any origin) and **route the campaign feed same-origin** (no ACAO today) | `GET api.westerndigital.com/wdwebservices/v2/us/products/search` → 200 with ACAO = request origin (preview + localhost probed 2026-10-15); `/graphql/execute.json/wd/clpcampaignendpoint` → 200, no ACAO (host-bound); `priceAndInventory` ACAO pinned to `aem.westerndigital.com` (row 12) |
| 15 | forms | contact-us topic chooser (6 AEM webforms: looking-to-purchase, careers, investor relations, website, loyalty, general), DCSP "Talk to an Expert" modal (looking-to-purchase), newsletter sign-up (footer "Sign Up for Email" → communications-registration), easy-recycle modal (definition only) | F | 3 pages authored under `/spike-a/` + every page linking `#talk-to-an-expert` / the newsletter page | rebuild-native | needs-backend | scaffolded-awaiting-owner (definition-driven `form` block; empty submit refused with live wording; filled submit captured locally with a visible "no backend connected" notice; endpoint wiring ready in `scripts/site-config.js`) | forms | **owner: form intake endpoint** — forms service / Marketo / the existing AEM webform servlets on the production host (`/bin/wd/sf/lead/sub`, `/bin/wd/formemail`, `/bin/wd/acs/formsubmit`, `/bin/wd/recycle`) | 9 definitions in `data/forms/*.json` (controls read after settle; no `regulated-pii`; `ext_regBusinessName` matched `/ssn/` — false positive); no `action` on any source form (handler-injected) |
| 16 | consent-cmp | Relyance consent banner (`consent.app.relyance.ai`) + Cookie Preferences footer link | T | 106/106 | embed-passthrough | needs-business-decision | interim: NOT loaded; "Cookie Preferences" footer link kept as authored text | consent-gated-tags | **owner: CMP + property id on the new host** | consent.app.relyance.ai |
| 17 | tag-manager | Adobe Launch (`assets.adobedtm.com`), `utag_data` / `dataLayer` settings objects | T/A | 106/106 | embed-passthrough | needs-business-decision | interim: not loaded (`scripts/delayed.js` hook reserved) | consent-gated-tags | **owner: Launch property for the new host** | assets.adobedtm.com |
| 18 | rum | Akamai mPulse, New Relic | T | 106/106 | embed-passthrough | needs-business-decision | interim: not loaded; EDS RUM ships by default | consent-gated-tags | owner: keep vendor RUM? | go-mpulse.net, newrelic.com |
| 19 | marketing-pixels | Facebook pixel | T | 106/106 | embed-passthrough | needs-business-decision | interim: not loaded | consent-gated-tags | owner | connect.facebook.net |
| 20 | live-chat | Genesys PureCloud chat launcher (fixed 65×65 iframe bottom-right) | T | 106/106 | embed-passthrough | needs-business-decision | interim: not loaded (pixel gate masks the 65×65 launcher region) | consent-gated-tags | **owner: deployment id for the new host** | apps.usw2.pure.cloud, api.usw2.pure.cloud |
| 21 | reviews | Bazaarvoice reviews (product pages) | T | product pages | embed-passthrough | needs-business-decision | decided-out with 14 (catalog stays on commerce host) | consent-gated-tags | owner | apps.bazaarvoice.com |
| 22 | locales | 60+ hreflang alternates (`/en-us`, `/de-de`, …) | I18N | site-wide | rebuild-native | needs-business-decision | interim: en-us tree only; hreflang emitted for en-us + x-default | locale-tree | **owner: locale scope of the migration** | hreflang set |
| 23 | calculators | RAID / surveillance capacity calculators | CR | 2 pages | client-only | self | done (`calculator` block, variants `raid` / `surveillance`; pages authored under `/spike-a/tools/*`, preview only — promotion to `/tools/*` is a content step) | client-compute | none | `capacity-form` without action, inline compute, no network (detect 2026-10-15); 25/25 known inputs → source outputs |

## Decision batch

One message to the owner; each item ships its interim tier now.

1. **Commerce (rows 12, 13, 14, 21):** does the catalog/store move? Interim: PDP, cart, account and compare links stay absolute to `www.westerndigital.com`; PLP grids, facets, sort and paging are fed live by the storefront search API (row 14, done); tile prices are the authored captured text where the document carries the product, the search API's catalog price otherwise (live per-SKU price hydration is row 12). For production: keep `api.westerndigital.com` CORS open to the new host; route `clpcampaignendpoint` same-origin (the campaign tile runs on a snapshot until then).
2. **Forms (15):** intake endpoint for the contact-us topics, Talk to an Expert, newsletter and recycle forms (`scripts/site-config.js` → `forms.endpoint` or per form id / page path; receives POST JSON `{ data, page, timestamp }`). Interim: UI rebuilt from the live definitions; submissions are captured in the browser with an explicit "no backend connected" notice — nothing reaches WD.
3. **Tags and consent (16–20):** CMP vendor + Launch property + RUM/pixel/chat ids for the new host. Interim: none loaded.
4. **Locales (22):** en-us only, or the locale tree? Interim: en-us.
5. **Search corpus (2):** migrated pages only (interim) vs. products too (needs commerce).

## Register (decided-out)

| feature | reason | production statement |
|---|---|---|
| cart / price / inventory hydration | session-bound commerce APIs, dead off-origin | "Cart and pricing remain on the Salesforce Commerce storefront; migrated pages link to it." |
| account / sign-in | authenticated commerce surface | "Sign-in stays on the storefront host." |
| product detail / compare / quick-view (PLPs are row 14, data-fed) | session- and cart-bound commerce surfaces | "Product detail, compare and quick-view stay on the storefront; listing tiles link to it." |
| Bazaarvoice reviews | product-page widget, catalog not migrated | "No reviews surface on migrated pages." |

## Amendment 2026-09-18 — Products menu wave (user decision)

The user asked to migrate every page under the header's **Products** menu. The product listing pages were
migrated as static pages: each `product-listing` block renders the captured first page of tiles; facets,
sort and pagination are inert. Row 14 is re-opened for **product listing pages only**:

| row | was | now |
|---|---|---|
| 14 product-catalog (PLP grids, facets, sort, pagination) | decided-out | **pending** — in scope by user decision; not triaged yet (disposition and reproducibility open) |
| 14 product-catalog (PDP, compare, quick-view) | decided-out | unchanged — tiles link absolute to the storefront PDP (`/products/<family>/<code>?sku=`) |
| 12 cart-hydration / price & inventory | decided-out | unchanged — tile prices are the captured values |

## Amendment 2026-10-15 — dynamics Phases 1–5 on rows 14, 15, 23 (branch `spike-a`)

Hands-off run; every other row untouched. Detect re-run on the rows' source pages (`/products/hdd/internal-hdd`, `/products/hdd`,
`/company/contact-us`, `/company/distributors/find-a-store`, `/solutions/data-center-storage-platform` (+ `/use-case-ai`),
`/tools/raid-capacity-calculator`, `/tools/surveillance-capacity-calculator`). Code on `spike-a`
(https://spike-a--sdt-westerndigital--aemcoder.aem.page); new content only under `/spike-a/…` (preview only). Parity:
`stardust/dynamics/parity.json` (features `product-catalog`, `forms`, `calculators`) → `stardust/qa/dynamics-report.md` 14/14.

| row | was | now |
|---|---|---|
| 14 product-catalog (PLP grids, facets, sort, pagination) | pending (not triaged) | **data-fed · self · done** — `product-listing` reads the storefront search API (CORS echoes any origin) from the `categories` / `condition` / `filters` rows already in every published PLP document: no content change, the existing pages light up on the code branch. 13/13 URL states = source count + order. Campaign tile = code-bus snapshot of a host-bound feed (interim). |
| 14 product-catalog (PDP, compare, quick-view) | decided-out | unchanged |
| 15 forms | scaffolded-awaiting-owner (submission blocked) | scaffolded-awaiting-owner (UI rebuilt; local capture with notice) — owner decision unchanged: intake endpoint. Preview submission replay **not run** (refused in the delegated run; awaiting the user's go-ahead); flows proven on the local dev server. |
| 15b find-a-store (split out of 15) | counted as a form page | **data-fed + client-only · self · pending** — a where-to-buy FILTER (region / country / brand / reseller type) over `GET /graphql/execute.json/wd/wtbendpoint` (744 KB, 1,524 items, no ACAO = host-bound). Not built this run: snapshot into `data/wtb/` with `_provenance` + a client-side filter block. |
| 15 — `/solutions/data-center-storage-platform/use-case-ai` | typed `form` | not a form: a headless tab-panel fragment of the DCSP page (0 controls); nothing to migrate under row 15 |
| 23 calculators | pending | **client-only · self · done** — `calculator` block (raid / surveillance), 25/25 known inputs = source; pages under `/spike-a/tools/*` |

