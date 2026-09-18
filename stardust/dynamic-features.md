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
- **products**: none on the migrated origin — the catalog is commerce-rendered (decided-out, see § Register).

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
| 14 | product-catalog | PLP filters, product grids, PDPs, compare, weekly sale (client-rendered from commerce APIs) | CR/X | 13 listing pages + all PDPs | decided-out | needs-backend | decided-out | decided-out | **owner decision**: catalog stays on the SFCC host (links absolute) until a commerce integration is scoped | PLP grids empty in server HTML |
| 15 | forms | contact-us, partner/channel registration, recycle form, newsletter sign-up, board contact | F | 4 form pages + footer "Sign Up for Email" | rebuild-native | needs-backend | scaffolded-awaiting-owner (UI rebuilt, submission blocked with a visible "no backend connected" notice) | forms | **owner: form intake endpoint (DA sheet / Marketo / existing AEM servlet)** | `forms 1+0` per probed page (search only); form pages typed `form` in state.json |
| 16 | consent-cmp | Relyance consent banner (`consent.app.relyance.ai`) + Cookie Preferences footer link | T | 106/106 | embed-passthrough | needs-business-decision | interim: NOT loaded; "Cookie Preferences" footer link kept as authored text | consent-gated-tags | **owner: CMP + property id on the new host** | consent.app.relyance.ai |
| 17 | tag-manager | Adobe Launch (`assets.adobedtm.com`), `utag_data` / `dataLayer` settings objects | T/A | 106/106 | embed-passthrough | needs-business-decision | interim: not loaded (`scripts/delayed.js` hook reserved) | consent-gated-tags | **owner: Launch property for the new host** | assets.adobedtm.com |
| 18 | rum | Akamai mPulse, New Relic | T | 106/106 | embed-passthrough | needs-business-decision | interim: not loaded; EDS RUM ships by default | consent-gated-tags | owner: keep vendor RUM? | go-mpulse.net, newrelic.com |
| 19 | marketing-pixels | Facebook pixel | T | 106/106 | embed-passthrough | needs-business-decision | interim: not loaded | consent-gated-tags | owner | connect.facebook.net |
| 20 | live-chat | Genesys PureCloud chat launcher (fixed 65×65 iframe bottom-right) | T | 106/106 | embed-passthrough | needs-business-decision | interim: not loaded (pixel gate masks the 65×65 launcher region) | consent-gated-tags | **owner: deployment id for the new host** | apps.usw2.pure.cloud, api.usw2.pure.cloud |
| 21 | reviews | Bazaarvoice reviews (product pages) | T | product pages | embed-passthrough | needs-business-decision | decided-out with 14 (catalog stays on commerce host) | consent-gated-tags | owner | apps.bazaarvoice.com |
| 22 | locales | 60+ hreflang alternates (`/en-us`, `/de-de`, …) | I18N | site-wide | rebuild-native | needs-business-decision | interim: en-us tree only; hreflang emitted for en-us + x-default | locale-tree | **owner: locale scope of the migration** | hreflang set |
| 23 | calculators | RAID / surveillance capacity calculators | CR | 2 pages | client-only | self | pending (rollout, dedicated `calculator` block; never flattened) | client-only | none | /tools/* |

## Decision batch

One message to the owner; each item ships its interim tier now.

1. **Commerce (rows 12, 13, 14, 21):** does the catalog/store move? Interim: all product, cart, account and PDP links stay absolute to `www.westerndigital.com`; captured prices are static text.
2. **Forms (15):** intake endpoint for contact / partner / recycle / newsletter forms. Interim: UI rebuilt, submit disabled with notice.
3. **Tags and consent (16–20):** CMP vendor + Launch property + RUM/pixel/chat ids for the new host. Interim: none loaded.
4. **Locales (22):** en-us only, or the locale tree? Interim: en-us.
5. **Search corpus (2):** migrated pages only (interim) vs. products too (needs commerce).

## Register (decided-out)

| feature | reason | production statement |
|---|---|---|
| cart / price / inventory hydration | session-bound commerce APIs, dead off-origin | "Cart and pricing remain on the Salesforce Commerce storefront; migrated pages link to it." |
| account / sign-in | authenticated commerce surface | "Sign-in stays on the storefront host." |
| product catalog (PLP/PDP/compare/weekly-sale) | client-rendered from commerce APIs | "Catalog pages are not migrated in this phase; navigation links point to the storefront." |
| Bazaarvoice reviews | product-page widget, catalog not migrated | "No reviews surface on migrated pages." |

## Amendment 2026-09-18 — Products menu wave (user decision)

The user asked to migrate every page under the header's **Products** menu. Rows 12/14 are re-dispositioned for
**product listing pages only**:

| row | was | now | evidence |
|---|---|---|---|
| 14 product-catalog (PLP grids, facets, sort, pagination) | decided-out | **client-rendered / self** — `product-listing` block fetches `api.westerndigital.com/wdwebservices/v2/us/products/search` (ACAO echoes the aem.page/aem.live origin; verified in-browser 2026-09-18). Query contract captured per page: `:relevance:category:<code>[:facet:value]`, `customQuery=*:* AND -optionalCondition_en_string_mv:*recertified*` (recertified: `+…*recertified*`, final-production: `*outlet*`, pageSize 70). `filterBy<Facet>=<value>` URL params map to `:<facet>:<value>`. | `stardust/.work/products-menu/api-calls.mjs` output, `scripts/wd-commerce.js` |
| 14 product-catalog (PDP, compare, quick-view) | decided-out | unchanged — tiles link absolute to the storefront PDP (`/products/<family>/<code>?sku=`) | — |
| 12 cart-hydration / price & inventory | decided-out | unchanged — `priceAndInventory` and `productreference.en-us.json` are CORS-dead on the new origin; tile prices come from the search payload (`priceData.formattedValue`, "Starting at") | in-browser fetch FAIL on aem.page |
| 9 product-reference-data | static-snapshot | authored product rails (What's New, Best Sellers, Portfolio) → `product-rail` block: authored PDP link + code per tile, price/image refreshed from the search API when reachable, authored capture text as fallback | — |
