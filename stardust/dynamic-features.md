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
- **products**: not query-index listings — the 7 PLPs are data-fed from the storefront search API (row 14, `product-listing` rows `categories` / `condition` / `facets` / `filter-limit`); PDPs stay on the storefront (§ Register).

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
| 14 | product-catalog | PLP product grid, facets, sort, pagination on the 7 Products-menu listing pages (PDP, compare, quick-view stay out — see § Register) | CR/A | 7 PLPs (hdd, internal-hdd, external-hdd, data-center-storage, accessories, recertified, final-production) | data-fed | self | done (spike-c, `/spike-c/products/**`) | off-origin-data (public API called directly) | none for the listing — prices stay row 12 (API tiles reuse the captured price of the same PDP, else none); the "Limited Time Offer" campaign tile (AEM graphql `clpcampaignendpoint`, www host) is not reproduced | `GET api.westerndigital.com/wdwebservices/v2/us/products/search` (CORS reflects the target origin; `client-logic cors` 200 from spike-c) · query/facets per page from the CLP component config (`categories` / `condition` rows) · flow vectors source = target 20/20 (`stardust/dynamics/client-logic/14-plp/`) |
| 15 | forms | contact-us topic switcher (10 topics: 6 forms + 4 authored panels), Talk to an Expert (data-center-storage-platform); recycle form + partner registration recorded, not built (pages not migrated); footer "Sign Up for Email" stays a link to the storefront page | F | contact-us + data-center-storage-platform (built); easy-recycle (pending its page) | rebuild-native | needs-backend | scaffolded-awaiting-owner (definition-driven `form` block live; filled submissions captured in the browser with a visible "not connected to a form backend" notice) | forms | **owner: intake endpoint per form** — source posts to production AEM servlets `/bin/wd/sf/lead/sub` (Salesforce/Marketo B2B lead) and `/bin/wd/formemail` (inbox relay) behind reCAPTCHA; set `scripts/site-config.js` `forms.endpoint(s)` | definitions `data/forms/*.json` from the live forms (validators + error copy from formbase.js); empty-submit parity 9/4/4/4/4/4 = live; 0 POSTs; `regulated-pii` flag on Company Name is a detector false positive (business name, not regulated) |
| 16 | consent-cmp | Relyance consent banner (`consent.app.relyance.ai`) + Cookie Preferences footer link | T | 106/106 | embed-passthrough | needs-business-decision | interim: NOT loaded; "Cookie Preferences" footer link kept as authored text | consent-gated-tags | **owner: CMP + property id on the new host** | consent.app.relyance.ai |
| 17 | tag-manager | Adobe Launch (`assets.adobedtm.com`), `utag_data` / `dataLayer` settings objects | T/A | 106/106 | embed-passthrough | needs-business-decision | interim: not loaded (`scripts/delayed.js` hook reserved) | consent-gated-tags | **owner: Launch property for the new host** | assets.adobedtm.com |
| 18 | rum | Akamai mPulse, New Relic | T | 106/106 | embed-passthrough | needs-business-decision | interim: not loaded; EDS RUM ships by default | consent-gated-tags | owner: keep vendor RUM? | go-mpulse.net, newrelic.com |
| 19 | marketing-pixels | Facebook pixel | T | 106/106 | embed-passthrough | needs-business-decision | interim: not loaded | consent-gated-tags | owner | connect.facebook.net |
| 20 | live-chat | Genesys PureCloud chat launcher (fixed 65×65 iframe bottom-right) | T | 106/106 | embed-passthrough | needs-business-decision | interim: not loaded (pixel gate masks the 65×65 launcher region) | consent-gated-tags | **owner: deployment id for the new host** | apps.usw2.pure.cloud, api.usw2.pure.cloud |
| 21 | reviews | Bazaarvoice reviews (product pages) | T | product pages | embed-passthrough | needs-business-decision | decided-out with 14 (catalog stays on commerce host) | consent-gated-tags | owner | apps.bazaarvoice.com |
| 22 | locales | 60+ hreflang alternates (`/en-us`, `/de-de`, …) | I18N | site-wide | rebuild-native | needs-business-decision | interim: en-us tree only; hreflang emitted for en-us + x-default | locale-tree | **owner: locale scope of the migration** | hreflang set |
| 23 | calculators | RAID / surveillance capacity calculators | CR/F | 2 pages | client-only | self | done (spike-c, `/spike-c/tools/*`; dedicated `calculator` block, never flattened) | client-only | none | `client-logic capture`: locus client, 0 requests on interaction; compute() re-implemented from `raid-capacity-calculator.js` + `surveillance-capacity-calculator.js`; vectors source = target 25/25 + 23/23 incl. validation states |

## Decision batch

One message to the owner; each item ships its interim tier now.

1. **Commerce (rows 12, 13, 21; row 14 PDP/compare only):** does the catalog/store move? Interim: all product, cart, account and PDP links stay absolute to `www.westerndigital.com`; captured prices are static text. (Row 14 listings are data-fed from the public search API since 2026-10-15 — no decision needed for them.)
2. **Forms (15):** intake endpoint per form — today `/bin/wd/sf/lead/sub` (Looking to Purchase → Salesforce/Marketo) and `/bin/wd/formemail` (Careers → jobs@, Investor Relations → investor@, Website/General → web inboxes, Pro Rewards → pro.rewards@), both production-only AEM servlets behind reCAPTCHA. Interim: form UI and validation live, submissions captured in the visitor's browser only with a visible "not connected to a form backend" notice; configure `scripts/site-config.js`.
3. **Tags and consent (16–20):** CMP vendor + Launch property + RUM/pixel/chat ids for the new host. Interim: none loaded.
4. **Locales (22):** en-us only, or the locale tree? Interim: en-us.
5. **Search corpus (2):** migrated pages only (interim) vs. products too (needs commerce).

## Register (decided-out)

| feature | reason | production statement |
|---|---|---|
| cart / price / inventory hydration | session-bound commerce APIs, dead off-origin | "Cart and pricing remain on the Salesforce Commerce storefront; migrated pages link to it." |
| account / sign-in | authenticated commerce surface | "Sign-in stays on the storefront host." |
| product catalog (PDP/compare/weekly-sale) | client-rendered from commerce APIs | "Product detail, compare and weekly-sale pages are not migrated in this phase; listing tiles link to the storefront." (PLP listings: row 14, data-fed) |
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

## Amendment 2026-10-15 — spike-c: rows 14, 15, 23 through Phases 1–5 (hands-off)

Branch `spike-c`, preview `https://spike-c--sdt-westerndigital--aemcoder.aem.page`; content authored as copies under `/spike-c/…` (originals untouched).

| row | was | now |
|---|---|---|
| 14 product-catalog (PLP grids, facets, sort, pagination) | pending (untriaged) | **data-fed · self · done** — public storefront search API, CORS-open; flow vectors 20/20 exact; prices remain row 12 |
| 15 forms | rebuild-native · needs-backend · scaffolded-awaiting-owner (UI not built) | **rebuild-native · needs-backend · scaffolded-awaiting-owner** — `form` block built and verified against the live validation; endpoint decision named (§ Decision batch 2) |
| 23 calculators | client-only · self · pending | **client-only · self · done** — logic recovered from the source scripts; vectors 48/48 exact |

Detect evidence: `stardust/current/spike-c/_dynamics.json` (7 pages); draft `stardust/dynamics/spike-c/` (target probe: 11/11 first-party paths dead on spike-c; the draft's `F needs-backend` on the calculators and `host-bound` on the search API are overruled by the client-logic evidence). Parity: `stardust/dynamics/parity.json` (`row-14-…`, `row-15-…`, `row-23-…`), replay `stardust/qa/spike-c/dynamics-report.md` 11/12 (the form-flow FAIL is the owner endpoint).
